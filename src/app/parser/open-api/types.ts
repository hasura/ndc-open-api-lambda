import * as logger from "../../../util/logger";

const AMBIGUOUS_PRIMITVE_TYPES = ["any", "object", "void", "object"];

export type Schema = {
  $ref: string;
  typeName: string;
  componentName: string;
  rawTypeData: SchemaProperty | undefined;
  typeData: SchemaProperty | undefined;

  $parsed: $ParsedSchema | undefined;

  // this variable is calculated by this package
  _requiresRelaxedTypeJsDocTag?: boolean;
};

export type SchemaProperty =
  | SchemaTypeScalar
  | SchemaTypeArray
  | SchemaTypeObject
  | SchemaTypeAllOf
  | SchemaTypeRef
  | SchemaTypeContent
  | SchemaTypeRawArg
  | SchemaTypePrimitive
  | SchemaTypeSecurityScheme
  | SchemaTypeSchema;

export type $ParsedSchema = {
  type: string | undefined;
  content: string | undefined;
};

enum ObjectTypeEnum {
  "object",
}

enum ArrayTypeEnum {
  "array",
}

enum ScalerTypeEnum {
  "integer",
  "string",
  "boolean",
  "number",
}

enum PrimitiveTypeEnum {
  "primitive",
  "object",
}

enum ParsedPrimitiveTypeEnum {
  "primitive",
}

enum SecuritySchemeTypeEnum {
  "apiKey",
  "oauth2",
  "http",
}

export type SchemaTypeObject = {
  type: ObjectTypeEnum | undefined;
  required: string[] | undefined;
  properties: Map<string, SchemaProperty> | undefined;
  example: string | undefined;
  description: string | undefined;
  $parsed: $ParsedSchema | undefined;
};

export type SchemaTypeScalar = {
  type: ScalerTypeEnum;
  required: boolean | undefined;
  nullable: boolean | undefined;
  format: string | undefined;
  example: string | undefined;
  description: string | undefined;
  enum: string[] | undefined;
  $parsed: $ParsedSchema | undefined;
};

export type SchemaTypeArray = {
  type: ArrayTypeEnum;
  items: SchemaProperty;
  required: boolean | undefined;
  nullable: boolean | undefined;
  example: string | undefined;
  description: string | undefined;
  $parsed: $ParsedSchema | undefined;
};

export type SchemaTypeRef = {
  $ref: string;
  example: string | undefined;
  description: string | undefined;
  $parsed: $ParsedSchema | undefined;
};

export type SchemaTypeAllOf = {
  allOf: SchemaProperty[];
  properties: Map<string, SchemaProperty> | undefined;
  $parsed: $ParsedSchema | undefined;
};

export type SchemaTypeContent = {
  content: Map<string, SchemaProperty>;
  example: string | undefined;
  description: string | undefined;
  required: boolean | undefined;
  nullable: boolean | undefined;
  $parsed: $ParsedSchema | undefined;
};

export type SchemaTypePrimitive = {
  type: PrimitiveTypeEnum;
  typeIdentifier: string;
  name: string;
  content: string;
  $parsed: $ParsedSchema | undefined;
};

export type SchemaTypeSecurityScheme = {
  type: SecuritySchemeTypeEnum;
  $parsed: $ParsedSchema | undefined;
};

export type SchemaTypeSchema = {
  description: string | undefined;
  schema: SchemaProperty;
  $parsed: $ParsedSchema | undefined;
};

/**
 * This type represents types that don't have `type` field.
 * Instead, they are parsed as raw args
 */
export type SchemaTypeRawArg = {
  type: string | undefined;
  example: string | undefined;
  description: string | undefined;
  in: string;
  name: string;
  required: boolean | undefined;
  nullable: boolean | undefined;
  schema: SchemaProperty;
};

export function getSchemaPropertyFromSchema(
  schema: Schema,
): SchemaProperty | undefined {
  if (schema.rawTypeData && canResolveSchema(schema.rawTypeData)) {
    return schema.rawTypeData;
  }
  if (schema.typeData && canResolveSchema(schema.typeData)) {
    return schema.typeData;
  }

  logger.error(`Cannot resolve schema types for ${schema.$ref} `);
  return undefined;
}

export function schemaPropertyIsTypeScaler(
  property: any,
): property is SchemaTypeScalar {
  return property.type && Object.values(ScalerTypeEnum).includes(property.type);
}

export function schemaPropertyIsTypeObject(
  property: any,
): property is SchemaTypeObject {
  if (property.type && !Object.values(ObjectTypeEnum).includes(property.type)) {
    // if property.type exists, then it should belong to ObjectTypeEnum
    return false;
  }
  return property.properties && Object.keys(property.properties).length > 0;
}

export function schemaPropertyIsTypeArray(
  property: any,
): property is SchemaTypeArray {
  return (
    property.type &&
    Object.values(ArrayTypeEnum).includes(property.type) &&
    property.items
  );
}

export function schemaPropertyIsTypeAllOf(
  property: any,
): property is SchemaTypeAllOf {
  return property.allOf !== null && property.allOf !== undefined;
}

export function schemaPropertyIsTypeRef(
  property: any,
): property is SchemaTypeRef {
  return property.$ref !== null && property.$ref !== undefined;
}

export function schemaPropertyIsTypeContent(
  property: any,
): property is SchemaTypeContent {
  if (property.content !== null && property.content !== undefined) {
    try {
      if (Object.keys(property.content).length > 0) {
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }
  return false;
}

export function schemaPropertyIsTypeRawArg(
  property: any,
): property is SchemaTypeRawArg {
  return property.in && property.name && property.schema;
}

export function schemaPropertyIsSecurityScheme(
  property: any,
): property is SchemaTypeSecurityScheme {
  return (
    property.type &&
    Object.values(SecuritySchemeTypeEnum).includes(property.type)
  );
}

export function schemaPropertyIsTypePrimitive(
  property: any,
): property is SchemaTypePrimitive {
  return (
    (property.type &&
      Object.values(PrimitiveTypeEnum).includes(property.type)) ||
    (property.$parsed &&
      Object.values(ParsedPrimitiveTypeEnum).includes(property.$parsed.type))
  );
}

export function schemaPropertyIsTypeSchema(
  property: any,
): property is SchemaTypeSchema {
  return property.schema && Object.keys(property.schema).length > 0;
}

export function schemaPropertyIsEnum(property: any): boolean {
  return (
    (schemaPropertyIsTypeScaler(property) &&
      property.enum &&
      Array.isArray(property.enum) &&
      property.enum.length > 0) ??
    false
  );
}

function canResolveSchema(schema: SchemaProperty) {
  return (
    schemaPropertyIsTypeScaler(schema) ||
    schemaPropertyIsTypeArray(schema) ||
    schemaPropertyIsTypeObject(schema) ||
    schemaPropertyIsTypeAllOf(schema) ||
    schemaPropertyIsTypeRef(schema) ||
    schemaPropertyIsTypeContent(schema) ||
    schemaPropertyIsTypeRawArg(schema) ||
    schemaPropertyIsTypePrimitive(schema) ||
    schemaPropertyIsSecurityScheme(schema) ||
    schemaPropertyIsTypeSchema(schema)
  );
}

export function getSchemaPropertyChildren(
  property: SchemaProperty,
): SchemaProperty[] {
  if (schemaPropertyIsTypeObject(property)) {
    return getSchemaTypeObjectChildern(property);
  } else if (schemaPropertyIsTypeArray(property)) {
    return getSchemaTypeArrayChildern(property);
  } else if (schemaPropertyIsTypeContent(property)) {
    return getSchemaTypeContentChildren(property);
  } else if (schemaPropertyIsTypeRawArg(property)) {
    return getSchemaTypeRawArgsChildren(property);
  } else if (schemaPropertyIsTypeAllOf(property)) {
    return getSchemaTypeAllOfChildren(property);
  } else if (schemaPropertyIsTypeSchema(property)) {
    return getSchemaTypeSchemaChildren(property);
  } else if (!canResolveSchema(property)) {
    // if schemaProperty is not of a known type, throw an error
    throw new Error(
      `Cannot resolve SchemaProperty: ${JSON.stringify(property)}`,
    );
  }
  return [];
}

export function getSchemaTypeObjectChildern(
  schemaProperty: SchemaTypeObject,
): SchemaProperty[] {
  if (schemaProperty && schemaProperty.properties) {
    return Object.values(schemaProperty.properties);
  } else {
    return [];
  }
}

export function getSchemaTypeArrayChildern(
  schemaProperty: SchemaTypeArray,
): SchemaProperty[] {
  if (schemaProperty && schemaProperty.items) {
    return [schemaProperty.items];
  } else {
    return [];
  }
}

export function getSchemaTypeContentChildren(
  schemaProperty: SchemaTypeContent,
): SchemaProperty[] {
  if (schemaProperty && schemaProperty.content) {
    return Object.values(schemaProperty.content);
  } else {
    return [];
  }
}

export function getSchemaTypeRawArgsChildren(
  schemaProperty: SchemaTypeRawArg,
): SchemaProperty[] {
  if (schemaProperty && schemaProperty.schema) {
    return [schemaProperty.schema];
  }
  return [];
}

export function getSchemaTypeAllOfChildren(
  schemaProperty: SchemaTypeAllOf,
): SchemaProperty[] {
  const properties: SchemaProperty[] = [];
  if (
    schemaProperty &&
    schemaProperty.allOf &&
    schemaProperty.allOf.length > 0
  ) {
    // we only return the 1st element in allOf[] because
    // the subsequent elements are primitve any types
    // (for unknown reason, this is an issue with the open-api -> typescript lib: swagger-typescript-api)
    // which result in false positive for the check of relaxed types
    properties.push(schemaProperty.allOf.at(0)!);
  }
  if (schemaProperty && schemaProperty.properties) {
    properties.push(...Object.values(schemaProperty.properties));
  }
  return properties;
}

export function getSchemaTypeSchemaChildren(
  schemaProperty: SchemaTypeSchema,
): SchemaProperty[] {
  if (schemaProperty.schema) {
    return [schemaProperty.schema];
  }
  return [];
}

export function primitiveSchemaPropertiveHasAmbigousType(
  property: SchemaTypePrimitive,
) {
  if (property.content) {
    return AMBIGUOUS_PRIMITVE_TYPES.indexOf(property.content) > -1;
  } else if (property.$parsed && property.$parsed.content) {
    return AMBIGUOUS_PRIMITVE_TYPES.indexOf(property.$parsed.content) > -1;
  }
}

/**
 * Checks whether a type should be marked as a RelaxedType
 * More on RelaxedTypes: https://github.com/hasura/ndc-nodejs-lambda?tab=readme-ov-file#relaxed-types
 */
export function schemaPropertyIsRelaxedType(schemaProperty: SchemaProperty) {
  if (schemaPropertyIsTypeScaler(schemaProperty)) {
    if (schemaPropertyIsEnum(schemaProperty)) {
      return true;
    }
  } else if (schemaPropertyIsTypePrimitive(schemaProperty)) {
    return primitiveSchemaPropertiveHasAmbigousType(schemaProperty);
  }
  return false;
}
