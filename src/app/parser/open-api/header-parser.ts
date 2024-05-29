import * as schemaTypes from "./types";
import * as routeTypes from "./route-types";
import * as logger from "../../../util/logger";

/**
 *
 * @param headersString The list of headers in the format: `key1=value1&key2=value2&key3=value3`
 * @returns map of header keys to header values
 */
export function parseHeaders(
  headersString: string | undefined,
): Map<string, string> {
  const headerMap = new Map<string, string>();
  if (!headersString) {
    return headerMap;
  }
  for (let h of headersString.split("&")) {
    const splitStr = h.split("=");
    const key = `${splitStr[0]}`;
    const value = splitStr.slice(1, splitStr.length).join("=");
    headerMap.set(key, value);
  }
  return headerMap;
}

export function parseRouteHeaders(route: routeTypes.ApiRoute): routeTypes.ParsedHeaders | undefined {
  if (!route.headersObjectSchema) {
    return undefined;
  }
  if (!schemaTypes.schemaPropertyIsTypeObject(route.headersObjectSchema)) {
    const basicChars = routeTypes.getBasicCharacteristics(route);
    logger.error(`Cannot parse headers for API Route: ${basicChars.method} ${basicChars.route}\nERROR: route.headersObjectSchema is not of type object`);
    return undefined;
  }
  const headers: Set<string> = new Set<string>(Object.keys(route.headersObjectSchema.properties));
  if (headers.size === 0) {
    return undefined;
  } 
  return headers;
}
