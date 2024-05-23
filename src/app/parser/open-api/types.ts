import * as logger from "../../../util/logger";

const AMBIGUOUS_PRIMITVE_TYPES = ["any", "object", "void", "object"];

export type Schema = {
  $ref: string;
  typeName: string;
  componentName: string;
  rawTypeData: SchemaProperty | undefined;
  typeData: SchemaProperty | undefined;

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
  | SchemaTypeSecurityScheme;

export type SchemaTypeObject = {
  type: "object";
  required: string[] | undefined;
  properties: Map<string, SchemaProperty> | undefined;
  example: string | undefined;
  description: string | undefined;
};

export type SchemaTypeScalar = {
  type: "integer" | "string" | "boolean" | "number";
  required: boolean | undefined;
  nullable: boolean | undefined;
  format: string | undefined;
  example: string | undefined;
  description: string | undefined;
  enum: string[] | undefined;
};

export type SchemaTypeArray = {
  type: "array";
  items: SchemaProperty;
  required: boolean | undefined;
  nullable: boolean | undefined;
  example: string | undefined;
  description: string | undefined;
};

export type SchemaTypeRef = {
  $ref: string;
  example: string | undefined;
  description: string | undefined;
};

export type SchemaTypeAllOf = {
  allOf: SchemaProperty[];
};

export type SchemaTypeContent = {
  content: Map<string, SchemaProperty>;
  example: string | undefined;
  description: string | undefined;
  required: boolean | undefined;
  nullable: boolean | undefined;
};

export type SchemaTypePrimitive = {
  type: "primitve";
  typeIdentifier: string;
  name: string;
  content: string;
};

export type SchemaTypeSecurityScheme = {
  type: "apiKey" | "oauth2" | "http";
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
  if (schema.rawTypeData && isSchemaPropertyOfAKnownType(schema.rawTypeData)) {
    return schema.rawTypeData;
  }
  if (schema.typeData && isSchemaPropertyOfAKnownType(schema.typeData)) {
    return schema.typeData;
  }

  logger.error(`Cannot resolve schema types for ${schema.$ref} `);
  return undefined;
}

export function schemaPropertyIsTypeScaler(
  property: any,
): property is SchemaTypeScalar {
  return (
    property.type &&
    (property.type === "integer" ||
      property.type === "string" ||
      property.type === "boolean" ||
      property.type === "number")
  );
}

export function schemaPropertyIsTypeObject(
  property: any,
): property is SchemaTypeObject {
  return (
    property.type &&
    property.type === "object" &&
    property.properties &&
    Object.keys(property.properties).length > 0
  );
}

export function schemaPropertyIsTypeArray(
  property: any,
): property is SchemaTypeArray {
  return property.type && property.type === "array" && property.items;
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
    (property.type === "apiKey" ||
      property.type === "oauth2" ||
      property.type === "http")
  );
}

export function schemaPropertyIsTypePrimitive(
  property: any,
): property is SchemaTypePrimitive {
  return (
    property.type &&
    property.type === "primitive" &&
    property.typeIdentifier &&
    property.content
  );
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

function isSchemaPropertyOfAKnownType(schema: SchemaProperty) {
  return (
    schemaPropertyIsTypeScaler(schema) ||
    schemaPropertyIsTypeArray(schema) ||
    schemaPropertyIsTypeObject(schema) ||
    schemaPropertyIsTypeAllOf(schema) ||
    schemaPropertyIsTypeRef(schema) ||
    schemaPropertyIsTypeContent(schema) ||
    schemaPropertyIsTypeRawArg(schema) ||
    schemaPropertyIsTypePrimitive(schema) ||
    schemaPropertyIsSecurityScheme(schema)
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
  if (schemaProperty && schemaProperty.allOf) {
    return schemaProperty.allOf;
  }
  return [];
}

export function primitiveSchemaPropertiveHasAmbigousType(
  property: SchemaTypePrimitive,
) {
  return AMBIGUOUS_PRIMITVE_TYPES.indexOf(property.content) > -1;
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
