export type Schema = {
  $ref: string;
  typeName: string;
  componentName: string;
  rawTypeData: SchemaProperty | undefined;
};

export type SchemaProperty =
  | SchemaTypeScalar
  | SchemaTypeArray
  | SchemaTypeObject
  | SchemaTypeAllOf
  | SchemaTypeRef
  | SchemaTypeRawArg;

export type SchemaTypeObject = {
  type: "object";
  required: string[] | undefined;
  properties: Record<string, SchemaProperty> | undefined;
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
  content: Record<string, SchemaProperty>;
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
