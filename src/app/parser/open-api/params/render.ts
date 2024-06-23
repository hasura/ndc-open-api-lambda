import * as types from "./types";
import * as logger from "../../../../util/logger";

export function renderParams(schema: types.Schema): types.Schema {
  let rendered: string | undefined = "";
  if (types.schemaIsTypeScalar(schema)) {
    rendered = renderScalarTypeSchema(schema);
  } else if (types.schemaIsTypeObject(schema)) {
    rendered = renderObjectTypeSchema(schema);
  } else if (types.schemaIsTypeArray(schema)) {
    rendered = renderArrayTypeSchema(schema);
  } else if (types.schemaIsTypeCustomType(schema)) {
    rendered = renderCustomTypeSchema(schema);
  } else if (types.schemaIsTypeRef(schema)) {
    rendered = renderRefTypeSchema(schema);
  } else if (types.schemaIsTypeOneOf(schema)) {
    rendered = renderOneOfTypeSchema(schema);
  } else if (types.schemaIsTypeAnyOf(schema)) {
    rendered = renderAnyOfTypeSchema(schema);
  } else if (types.schemaIsTypeAllOf(schema)) {
    rendered = renderAllOfTypeSchema(schema);
  } else {
    logger.error(`Cannot resolve parameter schema: ${JSON.stringify(schema)}`);
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

export function renderObjectTypeSchema(schema: types.SchemaTypeObject): string {
  const renderedProperties: string[] = [];
  const children = types.getScehmaTypeObjectChildrenMap(schema);
  for (const propertyName in children) {
    const property = children[propertyName]!;
    property!.name = propertyName; // ensure that the name property is present
    renderedProperties.push(renderParams(property)._$rendered!);
  }
  const paramType = `{ ${renderedProperties.join(" ")} }`;
  return renderSchema(paramType, schema);
}

export function renderArrayTypeSchema(schema: types.SchemaTypeArray): string {
  const renderedProperty = renderParams(
    types.getSchemaTypeArrayChild(schema),
  )._$rendered!;
  const paramType = `(${renderedProperty})[]`;
  return renderSchema(paramType, schema);
}

export function renderCustomTypeSchema(
  schema: types.SchemaTypeCustomType,
): string {
  const renderedProperty = renderParams(
    types.getSchemaTypeCustomChild(schema),
  )._$rendered!;
  return renderSchema(renderedProperty, schema);
}

export function renderRefTypeSchema(schema: types.SchemaTypeRef): string {
  // TODO: add schema store reference
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
  return renderSchema(paramType, schema);
}

export function renderOneOfTypeSchema(schema: types.SchemaTypeOneOf): string {
  const renderedProperties: string[] = [];
  for (const property of types.getSchemaTypeOneOfChildren(schema)) {
    renderedProperties.push(renderParams(property)._$rendered!);
  }
  const paramType = renderedProperties.join(" | ");
  return renderSchema(paramType, schema);
}

export function renderAnyOfTypeSchema(schema: types.SchemaTypeAnyOf): string {
  const renderedProperties: string[] = [];
  for (const property of types.getSchemaTypeAnyOfChildren(schema)) {
    renderedProperties.push(renderParams(property)._$rendered!);
  }
  const paramType = `| ${renderedProperties.join(" | ")}`;
  return renderSchema(paramType, schema);
}

export function renderAllOfTypeSchema(schema: types.SchemaTypeAllOf): string {
  const renderedProperties: string[] = [];
  for (const property of types.getSchemaTypeAllOfChildren(schema)) {
    renderParams(property);
    if (property._$rendered!.length > 0) {
      renderedProperties.push(property._$rendered!);
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
