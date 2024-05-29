import * as schemaTypes from "./types";
import * as routeTypes from "./route-types";
import * as logger from "../../../util/logger";

/**
 * For now, we won't be parsing headers for from api routes.
 * The DDN engine will send headers in as a parameter in the API requests
 * that we can simply add in our api calls.
 */

export function parseRouteHeaders(
  route: routeTypes.ApiRoute,
): routeTypes.ParsedHeaders | undefined {

  let localHeaders = new Set<string>();

  if (!schemaTypes.schemaPropertyIsTypeObject(route.headersObjectSchema)) {
    const basicChars = routeTypes.getBasicCharacteristics(route);
    logger.error(
      `Cannot parse headers for API Route '${basicChars.method.toUpperCase()} ${basicChars.route}': route.headersObjectSchema is not of type object\nroute.headersObjectSchema: ${JSON.stringify(route.headersObjectSchema)}`,
    );
  } else {
    localHeaders = route.headersObjectSchema ? new Set<string>(
      Object.keys(route.headersObjectSchema.properties),
    ) : new Set<string>();
  }

  const globalHeaders = /* context.getInstance().getGlobalHeaders()  ?? */ new Set<string>();
  const allHeaders = new Set<string>([...localHeaders, ...globalHeaders]);

  if (allHeaders.size === 0) {
    // no headers apply to this api route
    return {
      headers: undefined,
      rendered: undefined,
    }
  }

  return {
    headers: allHeaders,
    rendered: undefined,
  }
}
