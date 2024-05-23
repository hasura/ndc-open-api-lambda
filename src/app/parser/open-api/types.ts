export type Schema = {
  $ref: string;
  typeName: string;
  componentName: string;
  rawTypeData: SchemaProperty | undefined;

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
  | SchemaTypeRawArg;

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

export function schemaPropertyIsTypeScaler(property: any): property is SchemaTypeScalar {
  return (
    property.type &&
    (property.type === "integer" ||
      property.type === "string" ||
      property.type === "boolean" ||
      property.type === "number")
  );
}

export function schemaPropertyIsTypeObject(property: any): property is SchemaTypeObject {
  return property.type && property.type === "object";
}

export function schemaPropertyIsTypeArray(property: any): property is SchemaTypeArray {
  return property.type && property.type === "array" && property.items;
}

export function schemaPropertyIsTypeAllOf(property: any): property is SchemaTypeAllOf {
  return property.allOf !== null && property.allOf !== undefined;
}

export function schemaPropertyIsTypeRef(property: any): property is SchemaTypeRef {
  return property.$ref !== null && property.$ref !== undefined;
}

export function schemaPropertyIsTypeContent(property: any): property is SchemaTypeContent {
  return property.content !== null && property.content !== undefined;
}

export function schemaPropertyIsTypeRawArg(property: any): property is SchemaTypeRawArg {
  return property.in && property.name && property.schema;
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

export function getSchemaPropertyChildren(property: SchemaProperty): SchemaProperty[] {
  if (schemaPropertyIsTypeObject(property)) {
    console.log('getSchemaPropertyChildren: schemaProperty is object');
    return getSchemaTypeObjectChildern(property);
  } else if (schemaPropertyIsTypeArray(property)) {
    console.log('getSchemaPropertyChildren: schemaProperty is array');
    return getSchemaTypeArrayChildern(property);
  } else if (schemaPropertyIsTypeContent(property)) {
    console.log('getSchemaPropertyChildren: schemaProperty is content');
    return getSchemaTypeContentChildren(property);
  } else if (schemaPropertyIsTypeRawArg(property)) {
    console.log('getSchemaPropertyChildren: schemaProperty is is raw args');
    return getSchemaTypeRawArgsChildren(property);
  } else if (schemaPropertyIsTypeAllOf(property)) {
    console.log('getSchemaPropertyChildren: schemaProperty is all of');
    return getSchemaTypeAllOfChildren(property);
  }
  console.log('getSchemaPropertyChildren: schemaProperty is likely a scaler or ref. returning empty array');
  return [];
}

export function getSchemaTypeObjectChildern(schemaProperty: SchemaTypeObject): SchemaProperty[] {
  if (schemaProperty && schemaProperty.properties) {
    return Object.values(schemaProperty.properties);
  } else {
    return [];
  }
}

export function getSchemaTypeArrayChildern(schemaProperty: SchemaTypeArray): SchemaProperty[] {
  if (schemaProperty && schemaProperty.items) {
    return [schemaProperty.items];
  } else {
    return [];
  }
}

export function getSchemaTypeContentChildren(schemaProperty: SchemaTypeContent): SchemaProperty[] {
  if (schemaProperty && schemaProperty.content) {
    return Object.values(schemaProperty.content);
  } else {
    return [];
  }
}

export function getSchemaTypeRawArgsChildren(schemaProperty: SchemaTypeRawArg): SchemaProperty[] {
  if (schemaProperty && schemaProperty.schema) {
    return [schemaProperty.schema];
  }
  return [];
}

export function getSchemaTypeAllOfChildren(schemaProperty: SchemaTypeAllOf): SchemaProperty[] {
  if (schemaProperty && schemaProperty.allOf) {
    return schemaProperty.allOf;
  }
  return [];
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
  }
  return false;
}