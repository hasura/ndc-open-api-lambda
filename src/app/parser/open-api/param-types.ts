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
    allKeys.includes("_$rendered")
  );
}

export function getParameterName(schema: BaseSchema): string | undefined {
  if (schema.name) {
    return schema.name;
  }
  if (schema.paramName) {
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

export function getScehmaTypeObjectChildrenMap(
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
  };
}
