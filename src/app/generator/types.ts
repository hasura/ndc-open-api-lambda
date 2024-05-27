import * as swaggerTypescriptApi from "swagger-typescript-api";
import * as legacyApiTsGenerator from "../parser/open-api/api-generator";
import { ParsedSchemaStore } from "../parser/open-api/schema-parser";

export type GeneratedApiTsCode = {
  legacyTypedApiComponents: legacyApiTsGenerator.ApiComponents;
  schemaComponents: swaggerTypescriptApi.SchemaComponent[];
  routes: swaggerTypescriptApi.ParsedRoute[];
  typeNames: GeneratedTypeName[];
  files: swaggerTypescriptApi.GenerateApiOutput;
  schemaStore?: ParsedSchemaStore;
};

export type GeneratedTypeName = {
  typeName: string;
  rawTypeName: string | undefined;
  schemaType: "type-name" | "enum-key" | undefined;
};
