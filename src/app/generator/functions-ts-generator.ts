import * as legacyApiTsGenerator from "../open-api-generator/api-generator";
import * as paramsParser from "../open-api-generator/parser/types-parser";
import * as swaggerTypescriptApi from "swagger-typescript-api";
import * as legacyApiRouteParser from "../open-api-generator/parsedApiRoutes";
import * as context from "../context";
import { Eta } from "eta";
import * as types from "../types";

type ParsedFunctionComponents = {
  parsedRoute: swaggerTypescriptApi.ParsedRoute;
  parsedParams: paramsParser.ParsedTypes;
  parsedReturnType?: string; // TODO: String for now, change to correct type once parsing of return type is complete
  functionName?: string;
  functionDocumentation?: string;
  requiresReadOnlyAnnotation: boolean;
  requiresAllowRelaxedTypeAnnotation: boolean;
};

export async function generateFunctionsTsCode(
  legacyTypedApiComponents: legacyApiTsGenerator.ApiComponents,
  headersMap: Map<string, string> | undefined,
  baseUrl: string | undefined,
  parsedFunctionComponents?: ParsedFunctionComponents, // TODO: use this for instead of `legacyTypedApiComponents`
): Promise<types.GeneratedCode> {
  const legacyApiRoutesParser = new legacyApiRouteParser.ParsedApiRoutes(
    new Set<string>(legacyTypedApiComponents.getTypeNames()),
    legacyTypedApiComponents,
  );

  for (let route of legacyTypedApiComponents.routes) {
    legacyApiRoutesParser.parse(route);
  }

  const eta = new Eta({
    views: context.getInstance().getFunctionTsFileTemplateDirectory(),
  });

  let generatedFunctionsTsCode = eta.render(
    context.getInstance().getFunctionsTsFileTemplateFileName(),
    {
      // arguments passed to the template file
      apiRoutes: legacyApiRoutesParser.getApiRoutes(),
      importList: legacyApiRoutesParser.getImportList(),
      baseUrl: baseUrl ? baseUrl : "",
      headerMap: headersMap,
    },
  );

  const generatedCode: types.GeneratedCode = {
    filePath: context.getInstance().getFunctionsFileName(),
    fileContent: generatedFunctionsTsCode,
    fileType: "functions-ts",
  };
  return generatedCode;
}
