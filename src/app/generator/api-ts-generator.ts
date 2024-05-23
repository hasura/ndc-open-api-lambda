import * as swaggerTypescriptApi from "swagger-typescript-api";
import * as uriUtil from "../../util/file";
import * as context from "../context";
import * as legacyApiTsGenerator from "../parser/open-api/api-generator";
import * as functionParamsParser from "../parser/open-api/types-parser";
import * as openApiParser from "../parser/open-api/open-api-parser";
import * as types from "./types";

export async function generateApiTsCode(
  openApiUri: string,
): Promise<types.GeneratedApiTsCode> {
  const generatedSchemaComponents: swaggerTypescriptApi.SchemaComponent[] = [];
  const generatedRoutes: swaggerTypescriptApi.ParsedRoute[] = [];
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
    templates: context.getInstance().getApiTsFileTemplateDirectory(),
    hooks: {
      /**
       * Contains the full definition of the type, along with individual variables in objects
       */
      onCreateComponent: (component) => {
        generatedSchemaComponents.push(component);
      },

      onCreateRoute: (routeData) => {
        const route = processApiRoute(routeData, typedOpenApiComponents);
        generatedRoutes.push(routeData);
        return route;
      },

      /**
       * typename is the name of the type generated for typescript. eg. MainBlog
       * rawTypeName is equal to the component.typename from onCreateComponent hook.
       */
      onFormatTypeName: (typeName, rawTypeName, schemaType) => {
        processTypeName(
          typedOpenApiComponents,
          typeName,
          rawTypeName,
          schemaType,
        );
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

  typedOpenApiComponents.processNdcComponents();

  const generatedTsCode: types.GeneratedApiTsCode = {
    legacyTypedApiComponents: typedOpenApiComponents,
    schemaComponents: generatedSchemaComponents,
    routes: generatedRoutes,
    typeNames: generatedTypeNames,
    files: genenratedApiTsFiles,
  };

  return generatedTsCode;
}

// function processApiComponent(
//   component: swaggerTypescriptApi.SchemaComponent,
//   typedOpenApiComponents: legacyApiTsGenerator.ApiComponents,
// ) {
//   if (component.componentName === "schemas") {
//     // for now, we are only going to deal with schemas
//     typedOpenApiComponents.addComponent(component);
//   }
// }

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

function processTypeName(
  typedOpenApiComponents: legacyApiTsGenerator.ApiComponents,
  typeName: string,
  rawTypeName?: string,
  schemaType?: string,
) {
  typedOpenApiComponents.addTypes(
    rawTypeName ? rawTypeName : typeName,
    typeName,
  );
  if (schemaType && schemaType === "type-name") {
    typedOpenApiComponents.allGeneratedTypes.add(typeName);
  }
}
