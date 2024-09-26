import * as context from "../context";
import { Eta } from "eta";
import * as appTypes from "../types";
import * as routeTypes from "../parser/open-api/route-types";
import * as paramTypes from "../parser/open-api/param-types";
import { capitalizeFirstLetter } from "../../util/strings";
import { ParsedSchemaStore } from "../parser/open-api/schema-parser";

export type RouteComponents = {
  route: routeTypes.ApiRoute;
  params: paramTypes.Schema[];
  returnType: paramTypes.Schema;
};

export async function generateFunctionsTsCode(
  baseUrl: string | undefined,
  routeComponents: RouteComponents[],
  parsedSchemaStore: ParsedSchemaStore,
): Promise<appTypes.GeneratedCode> {
  const routeFunctions: FunctionComponents[] = [];

  for (const route of routeComponents) {
    const documentation = getDocumentation({
      description: routeTypes.getDescription(route.route),
      request: routeTypes.getFormattedRouteName(route.route),
      isGetRequest: routeTypes.isGetRequest(route.route),
      requiresRelaxedTypeAnnotation: requiresRelaxedTypeAnnotation(
        route.params,
        route.returnType,
      ),
    });

    const namespace = routeTypes.getNamespace(route.route);

    const apiTsFunctionName = routeTypes.getApiTsFunctionName(route.route);

    const functionName = getFunctionName({
      requestMethod: routeTypes.getRequestMethod(route.route),
      namespace: namespace,
      apiTsFunctionName: apiTsFunctionName,
    });

    routeFunctions.push({
      route: route.route,
      documentation,
      name: functionName,
      namespace: namespace,
      apiTsFunctionName,
      params: route.params,
      returnType: route.returnType,
    });
  }

  const eta = new Eta({
    views: context.getInstance().getFunctionsTsFileTemplateDirectory(),
  });

  let generatedFunctionsTsCode = eta.render(
    context.getInstance().getFunctionsTsFileTemplateFileName(),
    {
      // arguments passed to the template file
      routeFunctions: routeFunctions,
      importList: parsedSchemaStore.getAllTypeNames(),
      baseUrl: baseUrl ? baseUrl : "",
    },
  );

  const generatedCode: appTypes.GeneratedCode = {
    filePath: context.getInstance().getFunctionsFileName(),
    fileContent: generatedFunctionsTsCode,
    fileType: "functions-ts",
  };
  return generatedCode;
}

/**
 * this type holds all the parsed information
 * and is passed to the ejs template to generate
 * the functions.ts file
 */
type FunctionComponents = {
  route: routeTypes.ApiRoute;
  documentation: string;
  name: string;
  namespace?: string;
  apiTsFunctionName: string;
  params: paramTypes.Schema[];
  returnType: paramTypes.Schema;
};

function getDocumentation({
  description,
  request,
  requiresRelaxedTypeAnnotation,
  isGetRequest,
}: {
  description?: string;
  request: string;
  requiresRelaxedTypeAnnotation: boolean;
  isGetRequest: boolean;
}): string {
  var documentation = "/**";
  if (description) {
    documentation = documentation.concat(`\n * ${description}`);
  }
  documentation = documentation.concat(`\n * @request ${request}`);
  if (requiresRelaxedTypeAnnotation) {
    documentation = documentation.concat("\n * @allowrelaxedtypes");
  }
  if (isGetRequest) {
    documentation = documentation.concat("\n * @readonly");
  }
  documentation = documentation.concat("\n */");
  return documentation;
}

function getFunctionName({
  requestMethod,
  apiTsFunctionName,
  namespace,
}: {
  requestMethod: string;
  apiTsFunctionName: string;
  namespace?: string;
}): string {
  if (!namespace) {
    return `${requestMethod}${capitalizeFirstLetter(apiTsFunctionName)}`;
  }
  return `${requestMethod}${capitalizeFirstLetter(namespace)}${capitalizeFirstLetter(apiTsFunctionName)}`;
}

function requiresRelaxedTypeAnnotation(
  params: paramTypes.Schema[],
  returnType: paramTypes.Schema,
): boolean {
  for (const param of params) {
    if (param._$requiresRelaxedTypeTag) {
      return true;
    }
  }

  if (returnType._$requiresRelaxedTypeTag) {
    return true;
  }

  return false;
}
