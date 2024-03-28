import { ParsedRoute, generateApi, Hooks, SchemaComponent } from "swagger-typescript-api";
import * as path from 'path';
import { getTemplatesDirectory } from ".";

const CircularJSON = require('circular-json');

let templateDir: string; // cannot be a constant because calling `getTemplateDirectory` results in a compilation error


export class ApiComponents {
  rawTypeToTypeMap: Map<string, string>;
  typeToRawTypeMap: Map<string, string>;
  components: SchemaComponent[];
  routes: ParsedRoute[];

  constructor() {
    this.rawTypeToTypeMap = new Map<string, string>();
    this.typeToRawTypeMap = new Map<string, string>();
    this.components = [];
    this.routes = [];

    templateDir =  path.resolve(getTemplatesDirectory(), './custom')
  }

  public addComponent(component: SchemaComponent) {
    this.components.push(component);
  }

  public addTypes(rawType: string, type: string) {
    this.rawTypeToTypeMap.set(rawType, type);
    this.typeToRawTypeMap.set(type, rawType);
  }

  public addRoute(route: ParsedRoute) {
    this.routes.push(route);
  }

  public getTypeNames(): IterableIterator<string> {
    return this.typeToRawTypeMap.keys();
  }

  public getRoutes(): ParsedRoute[] {
    return this.routes;
  }
}

export async function generateOpenApiTypescriptFile(
  filename: string,
  url: string | undefined,
  filePath: string | undefined,
  outputDir: string,
  hooks: Hooks | undefined,
): Promise<ApiComponents> {
  const apiComponents = new ApiComponents();

  await generateApi({
    name: filename,
    url: url ? url : "",
    input: filePath,
    output: outputDir,
    templates: templateDir,
    silent: true,
    hooks: {
      onCreateComponent: (component) => {
        /**
         * Contains the full definition of the type, along with individual variables in objects
         */
        apiComponents.addComponent(component);
      },
      onCreateRequestParams: (rawType) => {

      },
      onCreateRoute: (routeData) => {

        apiComponents.addRoute(routeData);
      },
      onCreateRouteName: (routeNameInfo, rawRouteInfo) => {

      },
      onFormatRouteName: (routeInfo, templateRouteName) => {

      },
      onFormatTypeName: (typeName, rawTypeName, schemaType) => {
        /**
         * typename is the name of the type generated for typescript. eg. MainBlog
         * rawTypeName is equal to the component.typename from onCreateComponent hook.
         */
        apiComponents.addTypes(rawTypeName ? rawTypeName : typeName, typeName);
      },
      onInit: (configuration) => {

      },
      onPreParseSchema: (originalSchema, typeName, schemaType) => {

      },
      onParseSchema: (originalSchema, parsedSchema) => {

      },
      onPrepareConfig: (currentConfiguration) => {},
    },
  })

  return apiComponents;
}
