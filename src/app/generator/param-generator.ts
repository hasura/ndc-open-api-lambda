import * as types from "../parser/open-api/param-types";
import * as logger from "../../util/logger";
import { ParsedSchemaStore } from "../parser/open-api/schema-parser";

export function renderParams(
  schema: types.Schema,
  schemaStore: ParsedSchemaStore,
): types.Schema {
  let rendered: string | undefined = "";
  if (types.schemaIsTypeScalar(schema)) {
    rendered = renderScalarTypeSchema(schema);
  } else if (types.schemaIsTypeObject(schema)) {
    rendered = renderObjectTypeSchema(schema, schemaStore);
  } else if (types.schemaIsTypeArray(schema)) {
    rendered = renderArrayTypeSchema(schema, schemaStore);
  } else if (types.schemaIsTypeCustomType(schema)) {
    rendered = renderCustomTypeSchema(schema, schemaStore);
  } else if (types.schemaIsTypeRef(schema)) {
    rendered = renderRefTypeSchema(schema, schemaStore);
  } else if (types.schemaIsTypeOneOf(schema)) {
    rendered = renderOneOfTypeSchema(schema, schemaStore);
  } else if (types.schemaIsTypeAnyOf(schema)) {
    rendered = renderAnyOfTypeSchema(schema, schemaStore);
  } else if (types.schemaIsTypeAllOf(schema)) {
    rendered = renderAllOfTypeSchema(schema, schemaStore);
  } else {
    if (!types.schemaTypeIsEmpty(schema)) {
      logger.error(
        `Cannot resolve parameter schema: ${JSON.stringify(schema)}`,
      );
    }
  }
  schema._$rendered = rendered ?? "";
  return schema;
}

export function renderSchema(
  paramType: string,
  schema: types.BaseSchema,
): string {
  const parameterName = fixVariableName(types.getParameterName(schema));
  const isRequired = types.isSchemaRequired(schema);

  if (!parameterName) {
    return paramType;
  }

  if (isRequired) {
    return `${getSchemaDescriptionAsJsDoc(schema)} ${parameterName}: ${paramType},`;
  }
  return `${getSchemaDescriptionAsJsDoc(schema)} ${parameterName}?: ${paramType},`;
}

export function renderScalarTypeSchema(
  schema: types.SchemaTypeScalar,
): string | undefined {
  if (types.scalarSchemaIsNumber(schema)) {
    return renderScalarTypeNumberSchema(schema);
  } else if (types.scalarSchemaIsString(schema)) {
    return renderScalarTypeStringSchema(schema);
  } else if (types.scalarSchemaIsBoolean(schema)) {
    return renderScalarTypeBooleanSchema(schema);
  } else if (types.scalarSchemaIsObject(schema)) {
    return renderScalarTypeObjectSchema(schema);
  }
  return undefined;
}

export function renderScalarTypeNumberSchema(
  schema: types.SchemaTypeScalar,
): string {
  let paramType = "";
  if (schema.enum) {
    paramType = schema.enum.join(" | ");
    schema._$requiresRelaxedTypeTag = true;
  } else {
    paramType = "number";
  }
  return renderSchema(paramType, schema);
}

export function renderScalarTypeStringSchema(
  schema: types.SchemaTypeScalar,
): string {
  let paramType = "";
  if (schema.enum) {
    schema.enum = schema.enum.map((item) => `"${item}"`);
    paramType = schema.enum.join(" | ");
    schema._$requiresRelaxedTypeTag = true;
  } else {
    paramType = "string";
  }
  return renderSchema(paramType, schema);
}

export function renderScalarTypeBooleanSchema(
  schema: types.SchemaTypeScalar,
): string {
  let paramType = "";
  if (schema.enum) {
    paramType = schema.enum.join(" | ");
    schema._$requiresRelaxedTypeTag = true;
  } else {
    paramType = "boolean";
  }
  return renderSchema(paramType, schema);
}

export function renderScalarTypeObjectSchema(
  schema: types.SchemaTypeScalar,
): string {
  let paramType = "object";
  return renderSchema(paramType, schema);
}

export function renderObjectTypeSchema(
  schema: types.SchemaTypeObject,
  schemaStore: ParsedSchemaStore,
): string {
  const renderedProperties: string[] = [];
  const children = types.getScehmaTypeObjectChildrenMap(schema);
  for (const propertyName in children) {
    const property = children[propertyName]!;
    property!.name = propertyName; // ensure that the name property is present
    renderedProperties.push(renderParams(property, schemaStore)._$rendered!);

    // if the property requires relaxed type tag,
    // then the parent will need it too
    // more: https://github.com/hasura/ndc-nodejs-lambda?tab=readme-ov-file#relaxed-types
    if (property._$requiresRelaxedTypeTag === true) {
      schema._$requiresRelaxedTypeTag = true;
    }
  }
  const paramType = `{ ${renderedProperties.join(" ")} }`;
  return renderSchema(paramType, schema);
}

export function renderArrayTypeSchema(
  schema: types.SchemaTypeArray,
  schemaStore: ParsedSchemaStore,
): string {
  const childSchema = types.getSchemaTypeArrayChild(schema);
  const renderedProperty = renderParams(childSchema, schemaStore)._$rendered!;
  const paramType = `(${renderedProperty})[]`;

  // if the child requires relaxed type tag,
  // then the parent will need it too
  // more: https://github.com/hasura/ndc-nodejs-lambda?tab=readme-ov-file#relaxed-types
  if (childSchema._$requiresRelaxedTypeTag) {
    schema._$requiresRelaxedTypeTag = true;
  }
  return renderSchema(paramType, schema);
}

export function renderCustomTypeSchema(
  schema: types.SchemaTypeCustomType,
  schemaStore: ParsedSchemaStore,
): string {
  const renderedProperty =
    schema.type ??
    renderParams(types.getSchemaTypeCustomChild(schema), schemaStore)
      ._$rendered!;

  schema._$requiresRelaxedTypeTag = isRelaxedTypeTagRequiredForCustomTypeSchema(
    schema,
    schemaStore,
  );
  return renderSchema(renderedProperty, schema);
}

export function renderRefTypeSchema(
  schema: types.SchemaTypeRef,
  schemaStore: ParsedSchemaStore,
): string {
  let paramType = "";
  const parsedSchema = types.getParsedSchemaForSchemaTypeRef(schema);
  if (parsedSchema && parsedSchema.name) {
    paramType = parsedSchema.name;
  } else if (parsedSchema && parsedSchema.content) {
    paramType = parsedSchema.content;
  } else {
    const splitRef = schema.$ref.split("/");
    paramType = splitRef[splitRef.length - 1]!;
  }

  // we need to check if the schema for this $ref needs relaxed type tag
  const refSchema = schemaStore.getSchemaByRef(schema.$ref);
  if (refSchema) {
    schema._$requiresRelaxedTypeTag = refSchema._requiresRelaxedTypeJsDocTag;
  } else {
    const error = new Error(`Unable to find schema for ref: ${schema.$ref}`);
    logger.error(`Error while rendering Ref Type Schema: ${error}`);
  }

  return renderSchema(paramType, schema);
}

export function renderOneOfTypeSchema(
  schema: types.SchemaTypeOneOf,
  schemaStore: ParsedSchemaStore,
): string {
  const renderedProperties: string[] = [];
  for (const property of types.getSchemaTypeOneOfChildren(schema)) {
    renderedProperties.push(renderParams(property, schemaStore)._$rendered!);
  }
  const paramType = renderedProperties.join(" | ");

  // union types need to be marked with relaxed type tag
  // https://github.com/hasura/ndc-nodejs-lambda?tab=readme-ov-file#relaxed-types
  schema._$requiresRelaxedTypeTag = true;
  return renderSchema(paramType, schema);
}

export function renderAnyOfTypeSchema(
  schema: types.SchemaTypeAnyOf,
  schemaStore: ParsedSchemaStore,
): string {
  const renderedProperties: string[] = [];
  for (const property of types.getSchemaTypeAnyOfChildren(schema)) {
    renderedProperties.push(renderParams(property, schemaStore)._$rendered!);
  }
  const paramType = `| ${renderedProperties.join(" | ")}`;

  // union types need to be marked with relaxed type tag
  // https://github.com/hasura/ndc-nodejs-lambda?tab=readme-ov-file#relaxed-types
  schema._$requiresRelaxedTypeTag = true;
  return renderSchema(paramType, schema);
}

export function renderAllOfTypeSchema(
  schema: types.SchemaTypeAllOf,
  schemaStore: ParsedSchemaStore,
): string {
  const renderedProperties: string[] = [];
  for (const property of types.getSchemaTypeAllOfChildren(schema)) {
    renderParams(property, schemaStore);
    if (property._$rendered!.length > 0) {
      renderedProperties.push(property._$rendered!);

      // if any child requires relaxed type tag
      // then the parent would need it too
      if (property._$requiresRelaxedTypeTag === true) {
        schema._$requiresRelaxedTypeTag = true;
      }
    }
  }
  const paramType = renderedProperties.join(" & ");
  return renderSchema(paramType, schema);
}

export function getSchemaDescriptionAsJsDoc(schema: types.BaseSchema): string {
  if (!schema.description) {
    return "";
  }
  return `\n/** ${schema.description} */\n`; // we add a new line(s) because the formatter does not do that
}

/**
 * Since all API variable names may not be compatible with Typescript
 * this function makes variable names compatible with Typescript
 * by wrapping incompatible names in double quotes
 * @param name variable name
 * @returns a Typescript compatible variable name
 */
function fixVariableName(name?: string): string | undefined {
  if (!name) {
    return undefined;
  }
  // check if the string has special chars
  // if it does, enclose it in double quotes
  const hasSpecialCharsRegEx = /[!@#%^&*()+\-=\[\]{};':"\\|,.<>\/?]+/;
  const startsWithNumberRegEx = /^[0-9]/;
  if (hasSpecialCharsRegEx.test(name) || startsWithNumberRegEx.test(name)) {
    return `"${name}"`;
  } else {
    return name;
  }
}

/**
 * Since there is not a proper parser for custom type schemas
 * this function is an attempt at trying to figure out whether
 * a custom type schema may require relaxed type annotation using
 * string comparisons
 *
 * ### UNHANDLED CASES
 * - Exploed object types with type(s) that require relaxed type tag
 *     Eg. (petstore schema): ` { name: string, pet: Pet } `
 * - Intersection types with type(s) that require relaxed type tag
 *     Eg. (petstore schema): ` { petWithStatus: Pet & Status } `
 * @param schema
 */
function isRelaxedTypeTagRequiredForCustomTypeSchema(
  schema: types.SchemaTypeCustomType,
  schemaStore: ParsedSchemaStore,
): boolean {
  // since the type definition does not exits
  // there is no prcessing that can be done
  if (!schema.type) {
    return false;
  }

  // this type likely includes an enum
  if (schema.type.includes(" | ")) {
    return true;
  }

  // Extract the type. This needs to be processed further
  // and then it needs to be cross referenced with the schema store
  // to check if it requires a relaxed type tag
  let extractedType = schema.type;

  // Check if this type is an array
  if (extractedType.endsWith("[]")) {
    // remove '[]'
    extractedType = extractedType.substring(0, extractedType.length - 2);

    // if the type is enclosed in `()`, remove them
    if (extractedType.startsWith("(") && extractedType.endsWith(")")) {
      extractedType = extractedType.substring(1, extractedType.length - 1);
    }
  }

  // Check if the schema store has the schema for custom type
  // It is not guaranteed that the schema store will contain the schema
  // because the custom type maybe a complex type. For example, it may be an
  // exploded object with many fields: ` { a: string, b: int } `
  const extractedSchema = schemaStore.getSchemaByTypeName(extractedType);
  if (extractedSchema) {
    return extractedSchema._requiresRelaxedTypeJsDocTag ?? false;
  }
  return false;
}
