import {
  ParsedRoute,
  generateApi,
  Hooks,
  SchemaComponent,
} from "swagger-typescript-api";
import * as path from "path";
import { existsSync } from "fs";
import * as logger from "../../util/logger";
import * as TypesParser from "./parser/types-parser";
import * as OpenApiParser from "./parser/open-api-parser";
import * as context from "../context";

const CircularJSON = require("circular-json");

let templateDir: string; // cannot be a constant because calling `getTemplateDirectory` results in a compilation error

export type NdcSchemaComponent = {
  component: SchemaComponent;
  isRelaxedType: boolean; // components with this flag set to true need `@allowrelaxedtypes` annotation. More: https://github.com/hasura/ndc-nodejs-lambda?tab=readme-ov-file#relaxed-types
  isUntyped: boolean; // components with this flag set to true (like `any`) need to be wrapped in JSON before being returned
  rawTypeName: string; // path of the type, can be the same as `typename`, but not always.
  typeName: string; // name of the type (used in typescript files)
  ref: string;
};

export type ApiRoute = {
  route: ParsedRoute;
  paramSchema: TypesParser.ParsedTypes;
};

export class ApiComponents {
  rawTypeToTypeMap: Map<string, string>;
  typeToRawTypeMap: Map<string, string>;
  rawTypeNameToRefMap: Map<string, string>;
  refToRawTypeNameMap: Map<string, string>;
  refToSchemaComponentMap: Map<string, NdcSchemaComponent>;

  allGeneratedTypes: Set<string>;

  routes: ApiRoute[];

  constructor() {
    this.rawTypeToTypeMap = new Map<string, string>();
    this.typeToRawTypeMap = new Map<string, string>();
    this.rawTypeNameToRefMap = new Map<string, string>();
    this.refToRawTypeNameMap = new Map<string, string>();
    this.refToSchemaComponentMap = new Map<string, NdcSchemaComponent>();
    this.allGeneratedTypes = new Set<string>();
    this.routes = [];

    templateDir = context.getInstance().getApiTsFileTemplateDirectory();
  }

  public addComponent(component: SchemaComponent) {
    let ref = component.$ref;
    const rawTypeName = component.typeName;

    if (!ref) {
      ref = `#/customref/${component.componentName}/${rawTypeName}`;
      logger.warn(
        `$ref missing for component. setting ref to '${ref}'`,
        component,
      );
    }

    const ndcComponent: NdcSchemaComponent = {
      component: component,
      isRelaxedType: false,
      isUntyped: false,
      rawTypeName: rawTypeName,
      typeName: `${this.rawTypeToTypeMap.get(rawTypeName)}`,
      ref: ref,
    };

    this.rawTypeNameToRefMap.set(rawTypeName, ref);
    this.refToRawTypeNameMap.set(ref, rawTypeName);
    this.refToSchemaComponentMap.set(ref, ndcComponent);
  }

  public addTypes(rawType: string, type: string) {
    this.rawTypeToTypeMap.set(rawType, type);
    this.typeToRawTypeMap.set(type, rawType);
  }

  public addRoute(route: ApiRoute) {
    this.routes.push(route);
  }

  public getTypeNames(): Set<string> {
    return this.allGeneratedTypes;
  }

  public getRoutes(): ApiRoute[] {
    return this.routes;
  }

  public getNdcComponentByTypeName(
    typename: string,
  ): NdcSchemaComponent | undefined {
    const rawTypeName = this.typeToRawTypeMap.get(typename);
    if (!rawTypeName) {
      return undefined;
    }
    const ref = this.rawTypeNameToRefMap.get(rawTypeName);
    if (!ref) {
      return undefined;
    }
    return this.refToSchemaComponentMap.get(ref)!;
  }

  public getNdcComponentByRef(ref: string): NdcSchemaComponent | undefined {
    return this.refToSchemaComponentMap.get(ref);
  }

  public processNdcComponents() {
    for (let [key, value] of this.refToSchemaComponentMap) {
      let visitedRefs = new Set<string>();
      this.processNdcComponentUtil(value, visitedRefs);
    }
  }

  processNdcComponentUtil(
    component: NdcSchemaComponent,
    visitedRefs: Set<string>,
  ) {
    if (visitedRefs.has(component.ref)) {
      return;
    }
    visitedRefs.add(component.ref);
    if (
      !component.component.rawTypeData ||
      !component.component.rawTypeData.properties
    ) {
      return;
    }
    component.typeName = `${this.rawTypeToTypeMap.get(component.rawTypeName)}`;
    Object.entries(component.component.rawTypeData.properties).forEach(
      ([key, value]) => {
        const anyValue: any = value;
        if (anyValue["enum"] && anyValue["enum"].length > 0) {
          component.isRelaxedType = true;
          logger.debug(
            `'${key}' property of '${component.ref}' is an enum. '${component.ref}' marked as a relaxed type`,
          );
        }

        if (anyValue["$ref"]) {
          this.processNdcComponentUtil(
            this.refToSchemaComponentMap.get(anyValue["$ref"])!,
            visitedRefs,
          );
          if (
            this.refToSchemaComponentMap.get(anyValue["$ref"])!.isRelaxedType
          ) {
            component.isRelaxedType = true;
            logger.debug(
              `'${key}' property of '${component.ref}' is an enum. '${component.ref}' marked as a relaxed type`,
            );
          }
        }

        if (anyValue["type"] === "array") {
          if (anyValue["items"] && anyValue["items"]["$ref"]) {
            this.processNdcComponentUtil(
              this.refToSchemaComponentMap.get(anyValue["items"]["$ref"])!,
              visitedRefs,
            );
            if (
              this.refToSchemaComponentMap.get(anyValue["items"]["$ref"])!
                .isRelaxedType
            ) {
              component.isRelaxedType = true;
              logger.debug(
                `'${key}' property of '${component.ref}' is an enum. '${component.ref}' marked as a relaxed type`,
              );
            }
          }
        }
      },
    );
  }
}

// export async function generateOpenApiTypescriptFile(
//   filename: string,
//   url: string | undefined,
//   filePath: string | undefined,
//   outputDir: string,
//   hooks: Hooks | undefined,
//   shouldOverwriteFile: boolean,
// ): Promise<ApiComponents> {
//   const apiComponents = new ApiComponents();

//   if (!shouldOverwriteFile) {
//     if (existsSync(path.resolve(outputDir, filename))) {
//       logger.error(
//         `Error: ${filename} already exists at ${outputDir}\n\nSet env var NDC_OAS_FILE_OVERWRITE=true to enable file overwrite`,
//       );
//       process.exit(0); // silently exit early
//     }
//   }

//   await generateApi({
//     name: filename,
//     url: url ? url : "",
//     input: filePath,
//     output: outputDir,
//     templates: templateDir,
//     silent: true,
//     hooks: {
//       onCreateComponent: (component) => {
//         /**
//          * Contains the full definition of the type, along with individual variables in objects
//          */
//         if (component.componentName === "schemas") {
//           // for now, we are only going to deal with schemas
//           apiComponents.addComponent(component);
//         }
//       },
//       onCreateRequestParams: (rawType) => {},
//       onCreateRoute: (routeData) => {
//         const paramSchema = TypesParser.parse(routeData);
//         const apiRoute: ApiRoute = {
//           route: routeData,
//           paramSchema: paramSchema,
//         };
//         routeData.raw.description = OpenApiParser.fixDescription(
//           routeData.raw.description,
//         );
//         apiComponents.addRoute(apiRoute);
//         return routeData;
//       },
//       onCreateRouteName: (routeNameInfo, rawRouteInfo) => {},
//       onFormatRouteName: (routeInfo, templateRouteName) => {},
//       onFormatTypeName: (typeName, rawTypeName, schemaType) => {
//         /**
//          * typename is the name of the type generated for typescript. eg. MainBlog
//          * rawTypeName is equal to the component.typename from onCreateComponent hook.
//          */
//         apiComponents.addTypes(rawTypeName ? rawTypeName : typeName, typeName);
//         if (schemaType && schemaType === "type-name") {
//           apiComponents.allGeneratedTypes.add(typeName);
//         }
//       },
//       onInit: (configuration) => {},
//       onPreParseSchema: (originalSchema, typeName, schemaType) => {
//         originalSchema.description = OpenApiParser.fixDescription(
//           originalSchema.description,
//         );
//         return originalSchema;
//       },
//       onParseSchema: (originalSchema, parsedSchema) => {},
//       onPrepareConfig: (currentConfiguration) => {},
//       onBuildRoutePath: (data) => {},
//     },
//   });

//   apiComponents.processNdcComponents();

//   return apiComponents;
// }
