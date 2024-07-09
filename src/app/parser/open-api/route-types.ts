import * as swaggerTypescriptApi from "swagger-typescript-api";
import * as schemaTypes from "./types";
import * as paramTypes from "./param-types";
import * as logger from "../../../util/logger";

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
    type: string;
    content:
      | {
          "application/json":
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

export function getFormattedRouteName(route: ApiRoute): string {
  const basicChars = getBasicCharacteristics(route);
  return `${basicChars.method.toUpperCase()} :${basicChars.route}`;
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
    _$rendered: "",
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

  /**
   * Since there isn't a proper parser for return types
   * we'll render whatever is given by the library
   */
  const schema: paramTypes.SchemaTypeCustomType = {
    paramName: undefined,
    name: undefined,
    required: true,
    description: route.responseBodySchema?.description ?? "",
    type: schemaType,
    schema:
      route.responseBodySchema?.content?.["application/json"]?.schema ??
      paramTypes.getEmptySchema(),
    _$rendered: schemaType,
    _$forcedCustom: true,
    _$requiresRelaxedTypeTag: false,
  };
  return schema;
}

export function getQueryParamName(route: ApiRoute): string {
  return route.specificArgs.query?.name ?? "query";
}

export function isQueryParamRequired(route: ApiRoute): boolean {
  return route.specificArgs.query?.optional ?? true;
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
