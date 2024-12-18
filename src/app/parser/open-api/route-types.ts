import * as swaggerTypescriptApi from "swagger-typescript-api";
import * as schemaTypes from "./schema-types";
import * as paramTypes from "./param-types";
import * as logger from "../../../util/logger";
import * as paramGenerator from "../../generator/param-generator";
import { ParsedSchemaStore } from "./schema-parser";

const cj = require("circular-json");

enum RequestType {
  Get = "get",
  Post = "post",
  Put = "put",
  Delete = "delete",
  Patch = "patch",
}

export type ApiRoute = swaggerTypescriptApi.ParsedRoute & {
  headersObjectSchema: Headers | undefined;
  routeParams: {
    path: paramTypes.Schema[];
    header: paramTypes.Schema[];
    body: paramTypes.Schema[];
    query: paramTypes.Schema[];
    formData: paramTypes.Schema[];
    cookie: paramTypes.Schema[];
  };
  requestBodyInfo: paramTypes.Schema & {
    contentTypes: string[] | undefined;
    schema: paramTypes.Schema | undefined;
    type: string | undefined;
    paramName: string;
    required: boolean | undefined;
  };
  specificArgs: {
    body:
      | {
          name: string;
          optional: boolean;
          type: string;
        }
      | undefined;
    query:
      | {
          name: string;
          optional: boolean;
          type: string;
        }
      | undefined;
  };
  queryObjectSchema: paramTypes.Schema;
  pathObjectSchema: paramTypes.Schema;
  responseBodySchema: {
    description: string | undefined;
    contentKind: string | undefined;
    contentTypes: string[] | undefined;
    type: string;
    content:
      | {
          "application/json":
            | {
                schema: paramTypes.Schema | undefined;
              }
            | undefined;
          "application/xml":
            | {
                schema: paramTypes.Schema | undefined;
              }
            | undefined;
          "text/plain":
            | {
                schema: paramTypes.Schema | undefined;
              }
            | undefined;
          "plain/text":
            | {
                schema: paramTypes.Schema | undefined;
              }
            | undefined;
          "*/*":
            | {
                schema: paramTypes.Schema | undefined;
              }
            | undefined;
        }
      | undefined;
  };
  requestBodySchema: paramTypes.Schema;
};

export type Headers = schemaTypes.SchemaProperty;

export type BasicRouteCharacterstics = {
  route: string;
  method: string;
  usage: string;
};

export function getBasicCharacteristics(
  route: ApiRoute,
): BasicRouteCharacterstics {
  return {
    route: route.raw.route,
    method: route.raw.method,
    usage: route.routeName.usage,
  };
}

export function getNamespace(route: ApiRoute): string {
  return route.namespace;
}

/**
 * @returns the function name for this API in `api.ts` file
 */
export function getApiTsFunctionName(route: ApiRoute): string {
  return route.routeName.usage;
}

export function getDescription(route: ApiRoute): string | undefined {
  return route.raw.summary;
}

export function isGetRequest(route: ApiRoute): boolean {
  return route.raw.method === RequestType.Get;
}

export function isPostRequest(route: ApiRoute): boolean {
  return route.raw.method === RequestType.Post;
}

export function isPutRequest(route: ApiRoute): boolean {
  return route.raw.method === RequestType.Put;
}

export function isDeleteRequest(route: ApiRoute): boolean {
  return route.raw.method === RequestType.Delete;
}

export function isPatchRequest(route: ApiRoute): boolean {
  return route.raw.method === RequestType.Patch;
}

export function getRequestMethod(route: ApiRoute): string {
  return route.raw.method;
}

export function getApiPath(route: ApiRoute): string {
  return route.raw.route;
}

export function getFormattedRouteName(route: ApiRoute): string {
  const basicChars = getBasicCharacteristics(route);
  return `${basicChars.method.toUpperCase()} :${basicChars.route}`;
}

export function getAllParams(route: ApiRoute): paramTypes.Schema[] {
  const allParams: paramTypes.Schema[] = [
    ...(hasPathParams(route) ? getPathParams(route)! : []),
    ...(hasQueryParams(route) ? [getQueryParams(route)!] : []),
    ...(hasRequestBody(route) ? [getRequestBody(route)!] : []),
  ];

  // sort by required params before returning
  return allParams.sort((a, b) => (b.required ? 1 : 0) - (a.required ? 1 : 0));
}

export function getAllParamsRendered(
  route: ApiRoute,
  schemaStore: ParsedSchemaStore,
): paramTypes.Schema[] {
  const allParams = getAllParams(route);
  for (let param of allParams) {
    paramGenerator.renderParams(param, schemaStore);
  }
  return allParams;
}

export function getQueryParams(route: ApiRoute): paramTypes.Schema | undefined {
  if (!hasQueryParams(route)) {
    return undefined;
  }

  const params = route.queryObjectSchema;
  params.name = getQueryParamName(route);
  params.required = isQueryParamRequired(route);
  return params;
}

export function hasQueryParams(route: ApiRoute): boolean {
  return route.routeParams.query && route.routeParams.query.length > 0;
}

export function getPathParams(
  route: ApiRoute,
): paramTypes.Schema[] | undefined {
  if (!hasPathParams(route)) {
    return undefined;
  }
  return route.routeParams.path;
}

export function hasPathParams(route: ApiRoute): boolean {
  return route.routeParams.path && route.routeParams.path.length > 0;
}

export function hasRequestBody(route: ApiRoute): boolean {
  return (
    route.requestBodyInfo !== undefined &&
    route.requestBodyInfo.type !== undefined &&
    route.requestBodyInfo.type !== null
  );
}

export function getRequestBody(route: ApiRoute): paramTypes.Schema | undefined {
  if (!hasRequestBody(route)) {
    return undefined;
  }

  /**
   * Since there isn't a proper parser for request body
   * we'll render whatever is given by the library
   */
  const schema: paramTypes.SchemaTypeCustomType = {
    paramName: route.requestBodyInfo.paramName,
    name: route.requestBodyInfo.paramName,
    required: route.requestBodyInfo.required ?? false,
    description: "Request body",
    type: route.requestBodyInfo.type!,
    schema: route.requestBodyInfo.schema ?? paramTypes.getEmptySchema(),
    _$rendered: "", // the reason this is a blank string here is because render params will render it correctly according to its type
    _$forcedCustom: true,
    _$requiresRelaxedTypeTag: false,
  };
  return schema;
}

export function hasResponseType(route: ApiRoute): boolean {
  if (route.responseBodySchema?.type) {
    return true;
  }
  return false;
}

function getResponseSchemaUtil(route: ApiRoute): paramTypes.Schema | undefined {
  return route.responseBodySchema?.content?.["application/json"]?.schema
    ?? route.responseBodySchema?.content?.["text/plain"]?.schema
    ?? route.responseBodySchema?.content?.["application/xml"]?.schema
    ?? route.responseBodySchema?.content?.["plain/text"]?.schema
    ?? route.responseBodySchema?.content?.["*/*"]?.schema;
}

export function getResponseSchema(route: ApiRoute): paramTypes.Schema {
  let schemaType = route.responseBodySchema?.type;
  if (!hasResponseType(route)) {
    logger.warn(
      `No response type found for API Route ${getFormattedRouteName(route)}, switching to 'hasuraSdk.JSONValue'`,
    );
    logger.debug(
      `Response Schema for API Route ${getFormattedRouteName(route)}:\n${JSON.stringify(route.responseBodySchema)}`,
    );
    schemaType = "hasuraSdk.JSONValue";
  }

  let schema = getResponseSchemaUtil(route);

  if (!schema) {
    logger.warn(
      `No response schema type found for API Route ${getFormattedRouteName(route)}`,
    );
    logger.debug(
      `Response content types for API Route ${getFormattedRouteName(route)}:\n${JSON.stringify(route.responseBodySchema?.contentTypes ?? "")}`,
    );
    /**
     * Since there isn't a proper return type
     * we'll switch the type to `hasuraSdk.JSONValue`
     * and return a custom schema
     */
    schema = {
      paramName: undefined,
      name: undefined,
      required: true,
      description: route.responseBodySchema?.description ?? "",
      type: schemaType,
      schema: paramTypes.getEmptySchema(),
      _$rendered: schemaType,
      _$forcedCustom: true,
      _$requiresRelaxedTypeTag: false,
    };
    return schema;
  }
  schema._$rendered = schemaType;
  return schema;
}

export function getQueryParamName(route: ApiRoute): string {
  return route.specificArgs.query?.name ?? "query";
}

export function isQueryParamRequired(route: ApiRoute): boolean {
  return true; // route.specificArgs.query?.optional ?? true; // marked this as true becuase `api.ts` generator always seems to mark the query param as required
}

export type ParsedApiRoute = {
  originalRoute: ApiRoute;

  basicCharacteristics: BasicRouteCharacterstics;
  headers: ParsedHeaders | undefined;
};

export type ParsedHeaders = {
  headers: Set<string> | undefined;
  rendered: string | undefined;
};
