import * as legacyApiTsGenerator from "../open-api-generator/api-generator";
import * as paramsParser from "../open-api-generator/parser/types-parser";
import * as swaggerTypescriptApi from "swagger-typescript-api";
import * as legacyApiRouteParser from "../open-api-generator/parsedApiRoutes";
import * as context from "../context";
import { Eta } from "eta";
import * as prettier from "prettier";
import * as logger from "../../util/logger";
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

  try {
    generatedFunctionsTsCode = await prettier.format(generatedFunctionsTsCode, {
      parser: "typescript",
    });
  } catch (e) {
    logger.error(
      "Error while formatting code. The resulting code will be unformatted and may contain syntax errors. Error listed in debug logs",
    );
    logger.debug(e);
  }

  const generatedCode: types.GeneratedCode = {
    filePath: context.getInstance().getFunctionsFilePath(),
    fileContent: generatedFunctionsTsCode,
    fileType: "functions-ts",
  };
  return generatedCode;
}
