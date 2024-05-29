import * as swaggerTypescriptApi from "swagger-typescript-api";
import * as legacyApiTsGenerator from "../parser/open-api/api-generator";
import { ParsedSchemaStore } from "../parser/open-api/schema-parser";
import * as schemaTypes from "../parser/open-api/types";
import * as routeTypes from "../parser/open-api/route-types";

export type GeneratedApiTsCode = {
  legacyTypedApiComponents: legacyApiTsGenerator.ApiComponents;
  schemaComponents: schemaTypes.Schema[];
  routes: routeTypes.ApiRoute[];
  typeNames: GeneratedTypeName[];
  files: swaggerTypescriptApi.GenerateApiOutput;
  schemaStore?: ParsedSchemaStore;
};

export type GeneratedTypeName = {
  typeName: string;
  rawTypeName: string | undefined;
  schemaType: "type-name" | "enum-key" | undefined;
};
