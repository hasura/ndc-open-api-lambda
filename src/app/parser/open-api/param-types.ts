import { ParsedSchemaStore } from "./schema-parser";

export type Schema =
  | SchemaTypeRef
  | SchemaTypeObject
  | SchemaTypeScalar
  | SchemaTypeCustomType
  | SchemaTypeOneOf
  | SchemaTypeAnyOf
  | SchemaTypeAllOf
  | SchemaTypeArray
  | SchemaTypeEmpty;

/**
 * common properties shared across all types of Schema
 */
export type BaseSchema = {
  paramName: string | undefined; // some objects have the variable name as `paramName`
  name: string | undefined; // some objects have the variable name as `name`
  required: boolean | undefined;
  description: string | undefined;

  // Typescript representation of this schema
  _$rendered: string | undefined;

  // Boolean that denotes whether this variable requires a relaxed type tag
  // If a property has this set to true, then all ancestors should have have this set to true
  // More: https://github.com/hasura/ndc-nodejs-lambda?tab=readme-ov-file#relaxed-types
  _$requiresRelaxedTypeTag: boolean | undefined;
};

enum ObjectTypeEnum {
  "object",
}

enum NumberScalarTypeEnum {
  integer = "integer",
  number = "number",
}

enum StringScalarTypeEnum {
  string = "string",
}

enum BooleanScalarTypeEnum {
  boolean = "boolean",
}

enum ObjectScalarTypeEnum {
  object = "object",
}

const ScalarTypeEnum = {
  ...NumberScalarTypeEnum,
  ...StringScalarTypeEnum,
  ...BooleanScalarTypeEnum,
  ...ObjectScalarTypeEnum,
};

type ScalarTypeEnumType = NumberScalarTypeEnum &
  StringScalarTypeEnum &
  BooleanScalarTypeEnum &
  ObjectScalarTypeEnum;

enum ArrayTypeEnum {
  "array",
}

export type SchemaTypeRef = BaseSchema & {
  $ref: string;
  schema:
    | {
        $parsed: $Parsed | undefined;
      }
    | undefined;
  $parsed: $Parsed | undefined;
};

export type SchemaTypeObject = BaseSchema & {
  type: ObjectTypeEnum;
  properties: Record<string, Schema>;
};

export type SchemaTypeScalar = BaseSchema & {
  type: ScalarTypeEnumType;
  enum: string[] | undefined;
};

export type SchemaTypeArray = BaseSchema & {
  type: ArrayTypeEnum;
  items: Schema;
};

/**
 * CustomType refers to types declared in the type/data contract of the API
 * For example, in petstore, `Pet` is a custom type that has all the fields
 * associated with a pet
 */
export type SchemaTypeCustomType = BaseSchema & {
  type: string; // can be any valid type. Eg: Pet (in petstore API)
  schema: Schema;
  _$forcedCustom: boolean | undefined; // this forced custom value is set by code, when some schema type needs to be forced into being a custom schema
};

export type SchemaTypeOneOf = BaseSchema & {
  oneOf: Schema[];
};

export type SchemaTypeAnyOf = BaseSchema & {
  anyOf: Schema[];
};

export type SchemaTypeAllOf = BaseSchema & {
  allOf: Schema[];
};

/**
 * Created so that empty schema objects can be generated for parser usage
 * Unlikely to be actually part of the original Open API Document
 */
export type SchemaTypeEmpty = BaseSchema & {};

export type $Parsed = {
  type: string; // this is *NOT* the actual data type.
  name: string | undefined; // the actual data type of the object/ref
  content: string | undefined; // the actual data type of the object/ref
};

export function schemaIsTypeRef(schema: any): schema is SchemaTypeRef {
  return schema.$ref ?? false;
}

export function schemaIsTypeObject(schema: any): schema is SchemaTypeObject {
  return (
    schema.type &&
    Object.values(ObjectTypeEnum).includes(schema.type) &&
    schema.properties &&
    Object.keys(schema.properties).length >= 0
  );
}

export function schemaIsTypeScalar(schema: any): schema is SchemaTypeScalar {
  return (
    schema.type &&
    Object.values(ScalarTypeEnum).includes(schema.type) &&
    schema.properties === undefined
  );
}

export function schemaIsTypeCustomType(
  schema: any,
): schema is SchemaTypeCustomType {
  if (schema._$forcedCustom === true) {
    return true;
  }
  return (
    schema.schema &&
    schema.type &&
    !Object.values(ArrayTypeEnum).includes(schema.type) &&
    !Object.values(ObjectTypeEnum).includes(schema.type) &&
    !Object.values(ScalarTypeEnum).includes(schema.type) &&
    schema.$ref === undefined &&
    schema.items === undefined &&
    schema.anyOf === undefined &&
    schema.oneOf === undefined &&
    schema.allOf === undefined
  );
}

export function schemaIsTypeArray(schema: any): schema is SchemaTypeArray {
  return (
    schema.type &&
    Object.values(ArrayTypeEnum).includes(schema.type) &&
    schema.items
  );
}

export function scalarSchemaIsNumber(schema: SchemaTypeScalar): boolean {
  return Object.values(NumberScalarTypeEnum).includes(schema.type);
}

export function scalarSchemaIsString(schema: SchemaTypeScalar): boolean {
  return Object.values(StringScalarTypeEnum).includes(schema.type);
}

export function scalarSchemaIsBoolean(schema: SchemaTypeScalar): boolean {
  return Object.values(BooleanScalarTypeEnum).includes(schema.type);
}

export function scalarSchemaIsObject(schema: SchemaTypeScalar): boolean {
  return Object.values(ObjectScalarTypeEnum).includes(schema.type);
}

export function schemaIsTypeOneOf(schema: any): schema is SchemaTypeOneOf {
  return schema.oneOf && schema.oneOf.length > 0;
}

export function schemaIsTypeAnyOf(schema: any): schema is SchemaTypeAnyOf {
  return schema.anyOf && schema.anyOf.length > 0;
}

export function schemaIsTypeAllOf(schema: any): schema is SchemaTypeAllOf {
  return schema.allOf && schema.allOf.length > 0;
}

export function schemaTypeIsEmpty(schema: any): schema is SchemaTypeEmpty {
  const allKeys = Object.keys(schema);
  return (
    allKeys && // the object should have some keys
    allKeys.length === 5 && // the number of keys should be 5 (equal to number of properties in BaseSchema)
    //
    // the allKeys array should only have the properties present in BaseSchema
    allKeys.includes("paramName") &&
    allKeys.includes("name") &&
    allKeys.includes("required") &&
    allKeys.includes("description") &&
    allKeys.includes("_$rendered") &&
    allKeys.includes("_$requiresRelaxedTypeTag")
  );
}

export function getParameterName(schema: BaseSchema): string | undefined {
  if (schema.name) {
    return schema.name;
  }
  if (schema.paramName) {
    schema.name = schema.paramName; // ensure that every schema has a name property
    return schema.paramName;
  }
  return undefined;
}

export function isSchemaRequired(schema: BaseSchema): boolean {
  return schema.required ?? false;
}

export function getSchemaTypeObjectChildren(
  schema: SchemaTypeObject,
): Schema[] {
  return Array.from(Object.values(schema.properties));
}

export function getSchemaTypeObjectChildrenMap(
  schema: SchemaTypeObject,
): Record<string, Schema> {
  return schema.properties;
}

export function getSchemaTypeArrayChild(schema: SchemaTypeArray): Schema {
  return schema.items;
}

export function getSchemaTypeCustomChild(schema: SchemaTypeCustomType): Schema {
  return schema.schema;
}

export function getSchemaTypeOneOfChildren(schema: SchemaTypeOneOf): Schema[] {
  return schema.oneOf;
}

export function getSchemaTypeAnyOfChildren(schema: SchemaTypeAnyOf): Schema[] {
  return schema.anyOf;
}

export function getSchemaTypeAllOfChildren(schema: SchemaTypeAllOf): Schema[] {
  return schema.allOf;
}

export function getParsedSchemaForSchemaTypeRef(
  schema: SchemaTypeRef,
): $Parsed | undefined {
  if (schema.$parsed) {
    return schema.$parsed;
  } else if (schema.schema?.$parsed) {
    return schema.schema.$parsed;
  }
  return undefined;
}

export function getEmptySchema(): Schema {
  return {
    paramName: undefined,
    name: undefined,
    required: undefined,
    description: undefined,
    _$rendered: undefined,
    _$requiresRelaxedTypeTag: undefined,
  };
}

/**
 * Process a Schema and all its children to determine if a relaxed type tag is required
 * @param schema 
 * @param schemaStore 
 * @returns 
 */
export function isRelaxedTypeTagRequiredForSchema(schema: Schema, schemaStore: ParsedSchemaStore): boolean {
  if (schemaIsTypeRef(schema)) {
    schema._$requiresRelaxedTypeTag = isRelaxedTypeTagRequiredForRefTypeSchema(schema, schemaStore);
  } else if (schemaIsTypeObject(schema)) {
    schema._$requiresRelaxedTypeTag = isRelaxedTypeTagRequiredForObjectTypeSchemaDeep(schema, schemaStore);
  } else if (schemaIsTypeScalar(schema)) {
    schema._$requiresRelaxedTypeTag = isRelaxedTypeTagRequiredForScalarTypeSchema(schema);
  } else if (schemaIsTypeCustomType(schema)) {
    schema._$requiresRelaxedTypeTag = isRelaxedTypeTagRequiredForCustomTypeSchema(schema, schemaStore);
  } else if (schemaIsTypeArray(schema)) {
    schema._$requiresRelaxedTypeTag = isRelaxedTypeTagRequiredForArrayTypeSchemaDeep(schema, schemaStore);
  } else if (schemaIsTypeOneOf(schema)) {
    schema._$requiresRelaxedTypeTag = isRelaxedTypeTagRequiredForOneOfTypeSchema(schema);
  } else if (schemaIsTypeAnyOf(schema)) {
    schema._$requiresRelaxedTypeTag = isRelaxedTypeTagRequiredForAnyOfTypeSchema(schema);
  } else if (schemaIsTypeAllOf(schema)) {
    schema._$requiresRelaxedTypeTag = isRelaxedTypeTagRequiredForAllOfTypeSchema(schema);
  }
  return schema._$requiresRelaxedTypeTag ?? false;
}

/**
 * Function to determine if this scalar type schema requires
 * relaxed type tag
 *
 * More Reading: https://github.com/hasura/ndc-nodejs-lambda?tab=readme-ov-file#relaxed-types
 *
 * @param schema
 */
export function isRelaxedTypeTagRequiredForScalarTypeSchema(
  schema: SchemaTypeScalar,
): boolean {
  return (
    (scalarSchemaIsObject(schema) || (schema.enum && schema.enum.length > 1)) ??
    false
  );
}

/**
 * Function to determine if this object type schema requires
 * relaxed type tag
 *
 * More Reading: https://github.com/hasura/ndc-nodejs-lambda?tab=readme-ov-file#relaxed-types
 *
 * ### WARNING
 * This function should be called after all the children/properties of the schema
 * have been processed. This function *DOES NOT* process the tag requirements for the
 * schema's children/properties
 *
 * @param schema
 */
export function isRelaxedTypeTagRequiredForObjectTypeSchemaShallow(
  schema: SchemaTypeObject,
): boolean {
  const children = getSchemaTypeObjectChildrenMap(schema);
  for (const childName in children) {
    const child = children[childName];

    // if the property requires relaxed type tag,
    // then the parent will need it too, therefore, return true
    if (child!._$requiresRelaxedTypeTag === true) {
      return true;
    }
  }
  return false;
}

/**
 * Function to determine if this object type schema requires
 * relaxed type tag. 
 * This function also processes the tag requirements for its children
 *
 * More Reading: https://github.com/hasura/ndc-nodejs-lambda?tab=readme-ov-file#relaxed-types
 *
 * @param schema
 */
export function isRelaxedTypeTagRequiredForObjectTypeSchemaDeep(
  schema: SchemaTypeObject,
  schemaStore: ParsedSchemaStore,
): boolean {
  const children = getSchemaTypeObjectChildrenMap(schema);
  for (const child of Object.values(children)) {
    if (isRelaxedTypeTagRequiredForSchema(child, schemaStore)) {
      child._$requiresRelaxedTypeTag = true;
      return true;
    }
  }
  return false;
}

/**
 * Function to determine if this array type schema requires
 * relaxed type tag
 *
 * More Reading: https://github.com/hasura/ndc-nodejs-lambda?tab=readme-ov-file#relaxed-types
 *
 * ### WARNING
 * This function should be called after the child of the schema has been processed.
 * This function *DOES NOT* process the tag requirements for the schema's child
 *
 * @param schema
 */
export function isRelaxedTypeTagRequiredForArrayTypeSchemaShallow(
  schema: SchemaTypeArray,
): boolean {
  const child = getSchemaTypeArrayChild(schema);
  return child._$requiresRelaxedTypeTag ?? false;
}

/**
 * Function to determine if this array type schema requires
 * relaxed type tag
 * This function also processes the tag requirements for its children
 *
 * More Reading: https://github.com/hasura/ndc-nodejs-lambda?tab=readme-ov-file#relaxed-types
 * 
 * @param schema
 */
export function isRelaxedTypeTagRequiredForArrayTypeSchemaDeep(
  schema: SchemaTypeArray,
  schemaStore: ParsedSchemaStore,
): boolean {
  const child = getSchemaTypeArrayChild(schema);
  const required = isRelaxedTypeTagRequiredForSchema(child, schemaStore);
  child._$requiresRelaxedTypeTag = required;
  return child._$requiresRelaxedTypeTag;
}

/**
 * Function to determine if this ref type schema requires relaxed type tag
 *
 * More Reading: https://github.com/hasura/ndc-nodejs-lambda?tab=readme-ov-file#relaxed-types
 *
 * @param schema
 */
export function isRelaxedTypeTagRequiredForRefTypeSchema(
  schema: SchemaTypeRef,
  schemaStore: ParsedSchemaStore,
): boolean {
  const refSchema = schemaStore.getSchemaByRef(schema.$ref);
  if (!refSchema) {
    throw new Error(`Unable to find schema for ref: ${schema.$ref}`);
  }
  return refSchema._requiresRelaxedTypeJsDocTag ?? false;
}

/**
 * Function to determine if this oneOf type schema requires relaxed type tag
 *
 * More Reading: https://github.com/hasura/ndc-nodejs-lambda?tab=readme-ov-file#relaxed-types
 *
 * @param schema
 */
export function isRelaxedTypeTagRequiredForOneOfTypeSchema(
  schema: SchemaTypeOneOf,
): boolean {
  return schema.oneOf.length > 1;
}

/**
 * Function to determine if this anyOf type schema requires relaxed type tag
 *
 * More Reading: https://github.com/hasura/ndc-nodejs-lambda?tab=readme-ov-file#relaxed-types
 *
 * @param schema
 */
export function isRelaxedTypeTagRequiredForAnyOfTypeSchema(
  schema: SchemaTypeAnyOf,
): boolean {
  return schema.anyOf.length > 1;
}

/**
 * Function to determine if this allOf type schema requires
 * relaxed type tag
 *
 * More Reading: https://github.com/hasura/ndc-nodejs-lambda?tab=readme-ov-file#relaxed-types
 *
 * ### WARNING
 * This function should be called after all the children/properties of the schema
 * have been processed. This function *DOES NOT* process the tag requirements for the
 * schema's children/properties
 *
 * @param schema
 */
export function isRelaxedTypeTagRequiredForAllOfTypeSchema(
  schema: SchemaTypeAllOf,
): boolean {
  for (const child of getSchemaTypeAllOfChildren(schema)) {
    if (child._$requiresRelaxedTypeTag === true) {
      // if the property requires relaxed type tag,
      // then the parent will need it too, therefore, return true
      return true;
    }
  }
  return false;
}

/**
 * Function to determine if this custom type schema requires
 * relaxed type tag
 *
 * More Reading: https://github.com/hasura/ndc-nodejs-lambda?tab=readme-ov-file#relaxed-types
 *
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
 *
 * @param schema
 * @param schemaStore
 */
export function isRelaxedTypeTagRequiredForCustomTypeSchema(
  schema: SchemaTypeCustomType,
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
