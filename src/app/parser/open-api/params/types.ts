export type Schema =
  | SchemaTypeRef
  | SchemaTypeObject
  | SchemaTypeScalar
  | SchemaTypeCustomType
  | SchemaTypeOneOf
  | SchemaTypeAnyOf
  | SchemaTypeAllOf
  | SchemaTypeArray;

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
  schema: SchemaTypeRef | SchemaTypeArray;
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
  return (
    schema.schema &&
    (schemaIsTypeRef(schema.schema) || schemaIsTypeArray(schema.schema)) &&
    schema.$ref === undefined
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
