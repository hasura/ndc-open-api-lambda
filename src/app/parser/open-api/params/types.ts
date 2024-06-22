export type Schema =
  | SchemaTypeRef
  | SchemaTypeObject
  | SchemaTypeScalar
  | SchemaTypeArray;

export type BaseSchema = {
  paramName: string | undefined; // some objects have the variable name as `paramName`
  name: string | undefined; // some objects have the variable name as `name`
  required: boolean | undefined;
  description: string | undefined;
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

const ScalarTypeEnum = {
  ...NumberScalarTypeEnum,
  ...StringScalarTypeEnum,
  ...BooleanScalarTypeEnum,
};

type ScalarTypeEnumType = NumberScalarTypeEnum &
  StringScalarTypeEnum &
  BooleanScalarTypeEnum;

enum ArrayTypeEnum {
  "array",
}

export type SchemaTypeRef = {
  $ref: string;
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

export type ParsedSchema = {
  rendered: string;

  schema: Schema;
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
  return schema.type && Object.values(ScalarTypeEnum).includes(schema.type);
}

export function schemaIsTypeCustomType(
  schema: any,
): schema is SchemaTypeCustomType {
  return (
    schema.schema &&
    (schemaIsTypeRef(schema.schema) || schemaIsTypeArray(schema.schema))
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
