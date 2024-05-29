import * as swaggerTypescriptApi from "swagger-typescript-api";
import * as schemaTypes from "./types";

export type ApiRoute = swaggerTypescriptApi.ParsedRoute & {
  headersObjectSchema: Headers | undefined;
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

export type ParsedApiRoute = {
  originalRoute: ApiRoute;

  basicCharacteristics: BasicRouteCharacterstics;
  headers: ParsedHeaders | undefined;
};

export type ParsedHeaders = {
  headers: Set<string> | undefined,
  rendered: string | undefined,
};
