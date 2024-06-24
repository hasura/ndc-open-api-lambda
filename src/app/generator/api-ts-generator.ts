import * as swaggerTypescriptApi from "swagger-typescript-api";
import * as uriUtil from "../../util/file";
import * as context from "../context";
import * as legacyApiTsGenerator from "../parser/open-api/api-generator";
import * as functionParamsParser from "../parser/open-api/types-parser";
import * as openApiParser from "../parser/open-api/open-api-parser";
import * as types from "./types";
import * as schemaTypes from "../parser/open-api/types";
import * as routeTypes from "../parser/open-api/route-types";

export async function generateApiTsCode(
  openApiUri: string,
): Promise<types.GeneratedApiTsCode> {
  const generatedSchemaComponents: schemaTypes.Schema[] = [];
  const generatedRoutes: routeTypes.ApiRoute[] = [];
  const generatedTypeNames: types.GeneratedTypeName[] = [];

  let openApiUrl: string = "";
  let openApiFilePath: string = "";

  if (uriUtil.isValidUrl(openApiUri)) {
    openApiUrl = openApiUri;
  } else {
    openApiFilePath = uriUtil.getFilePath(openApiUri);
  }

  const typedOpenApiComponents = new legacyApiTsGenerator.ApiComponents();

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
        Void: "void",
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
        const route = processApiRoute(routeData, typedOpenApiComponents);
        generatedRoutes.push(routeData as routeTypes.ApiRoute);
        return route;
      },

      /**
       * typename is the name of the type generated for typescript. eg. MainBlog
       * rawTypeName is equal to the component.typename from onCreateComponent hook.
       */
      onFormatTypeName: (typeName, rawTypeName, schemaType) => {
        const generatedTypeName: types.GeneratedTypeName = {
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

  const generatedTsCode: types.GeneratedApiTsCode = {
    legacyTypedApiComponents: typedOpenApiComponents,
    schemaComponents: generatedSchemaComponents,
    routes: generatedRoutes,
    typeNames: generatedTypeNames,
    files: genenratedApiTsFiles,
  };

  return generatedTsCode;
}

function processApiRoute(
  route: swaggerTypescriptApi.ParsedRoute,
  typedOpenApiComponents: legacyApiTsGenerator.ApiComponents,
): swaggerTypescriptApi.ParsedRoute {
  const paramSchema = functionParamsParser.parse(route);
  const apiRoute: legacyApiTsGenerator.ApiRoute = {
    route: route,
    paramSchema: paramSchema,
  };
  route.raw.description = openApiParser.fixDescription(route.raw.description);
  typedOpenApiComponents.addRoute(apiRoute);
  return route;
}
