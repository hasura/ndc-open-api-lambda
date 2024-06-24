import * as swaggerTypescriptApi from "swagger-typescript-api";
import * as schemaTypes from "./types";
import * as paramTypes from "./param-types";

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
  responseBodySchema: paramTypes.Schema;
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
    route.requestBodyInfo.type !== null &&
    route.requestBodyInfo.schema !== undefined &&
    route.requestBodyInfo.schema !== null
  );
}

export function getRequestBody(route: ApiRoute): paramTypes.Schema | undefined {
  if (!hasRequestBody(route)) {
    return undefined;
  }
  return route.requestBodyInfo;
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
