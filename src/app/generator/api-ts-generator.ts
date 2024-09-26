import * as swaggerTypescriptApi from "swagger-typescript-api";
import * as uriUtil from "../../util/file";
import * as context from "../context";
import * as openApiParser from "../parser/open-api/open-api-parser";
import * as schemaTypes from "../parser/open-api/schema-types";
import * as routeTypes from "../parser/open-api/route-types";
import { ParsedSchemaStore } from "../parser/open-api/schema-parser";
import * as logger from "../../util/logger";

/**
 * This type holds the information about the generated API TypeScript code.
 */
export type GeneratedApiTsCode = {
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

export async function generateApiTsCode(
  openApiUri: string,
): Promise<GeneratedApiTsCode> {
  const generatedSchemaComponents: schemaTypes.Schema[] = [];
  const generatedRoutes: routeTypes.ApiRoute[] = [];
  const generatedTypeNames: GeneratedTypeName[] = [];

  let openApiUrl: string = "";
  let openApiFilePath: string = "";

  if (uriUtil.isValidUrl(openApiUri)) {
    openApiUrl = openApiUri;
  } else {
    openApiFilePath = uriUtil.getFilePath(openApiUri);
  }

  const genenratedApiTsFiles = await swaggerTypescriptApi.generateApi({
    name: context.getInstance().getApiFileName(),
    url: openApiUrl,
    input: openApiFilePath,
    output: false, // this denotes that the output should be returned to a variable and not written to a file,
    silent: true,
    defaultResponseType: "hasuraSdk.JSONValue",
    codeGenConstructs: (struct) => ({
      Keyword: {
        Number: "number",
        String: "string",
        Boolean: "boolean",
        Any: "any",
        Void: "hasuraSdk.JSONValue",
        Unknown: "unknown",
        Null: "null",
        Undefined: "undefined",
        Object: "hasuraSdk.JSONValue",
        File: "File",
        Date: "Date",
        Type: "type",
        Enum: "enum",
        Interface: "interface",
        Array: "Array",
        Record: "Record",
        Intersection: "&",
        Union: "|",
      },
    }),
    templates: context.getInstance().getApiTsFileTemplateDirectory(),
    hooks: {
      /**
       * Contains the full definition of the type, along with individual variables in objects
       */
      onCreateComponent: (component) => {
        const anyComponent: any = component;
        generatedSchemaComponents.push(anyComponent as schemaTypes.Schema);
      },

      onCreateRoute: (routeData) => {
        const parsedRoute: routeTypes.ApiRoute =
          routeData as routeTypes.ApiRoute;
        logger.info(
          `Processing route: ${routeTypes.getBasicCharacteristics(parsedRoute).method.toUpperCase()} ${routeTypes.getBasicCharacteristics(parsedRoute).route}`,
        );
        const route = processApiRoute(parsedRoute);
        generatedRoutes.push(route);
        return route;
      },

      /**
       * typename is the name of the type generated for typescript. eg. MainBlog
       * rawTypeName is equal to the component.typename from onCreateComponent hook.
       */
      onFormatTypeName: (typeName, rawTypeName, schemaType) => {
        const generatedTypeName: GeneratedTypeName = {
          typeName,
          rawTypeName,
          schemaType,
        };
        generatedTypeNames.push(generatedTypeName);
      },

      onPreParseSchema: (originalSchema, typeName, schemaType) => {
        originalSchema.description = openApiParser.fixDescription(
          originalSchema.description,
        );
        return originalSchema;
      },
    },
  });

  const generatedTsCode: GeneratedApiTsCode = {
    schemaComponents: generatedSchemaComponents,
    routes: generatedRoutes,
    typeNames: generatedTypeNames,
    files: genenratedApiTsFiles,
  };

  return generatedTsCode;
}

/**
 * processes the route and fixes the description (removes early end of typescript multiline comments due to cron job patterns mostly)
 * @param route
 * @returns
 */
function processApiRoute(route: routeTypes.ApiRoute): routeTypes.ApiRoute {
  route.raw.description = openApiParser.fixDescription(route.raw.description);
  return route;
}
