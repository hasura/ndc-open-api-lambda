import * as swaggerTypescriptApi from "swagger-typescript-api";
import * as parserTypes from "./types";
import * as generatorTypes from "../../generator/types";

export function parse(schemaComponent: swaggerTypescriptApi.SchemaComponent) {}

type Mappings = {
  rawTypeToTypeNameMap: Map<string, string>;
  typeNameToRawTypeMap: Map<string, string>;
  refToRawTypeNameMap: Map<string, string>;
  rawTypeNameToRefMap: Map<string, string[]>; // in some open api docs, same raw type name could map to multiple refs
  refToSchemaMap: Map<string, parserTypes.Schema>;
};

export function getParsedSchema(
  typeNames: generatorTypes.GeneratedTypeName[],
  schemaComponents: swaggerTypescriptApi.SchemaComponent[],
): SchemaParser {
  const schemaParser = new SchemaParser();

  for (const typeName of typeNames) {
    schemaParser.createTypeNameMapping(
      typeName.typeName,
      typeName.rawTypeName!,
    );
  }

  for (const component of schemaComponents) {
    schemaParser.createSchemaMapping(component as parserTypes.Schema);
  }

  Array.from(schemaParser.mappings.refToSchemaMap.values()).forEach(
    (schema) => {
      schemaParser.parseSchema(schema, new Set<string>());
    },
  );

  return schemaParser;
}

class SchemaParser {
  mappings: Mappings;

  constructor() {
    this.mappings = {
      rawTypeToTypeNameMap: new Map<string, string>(),
      typeNameToRawTypeMap: new Map<string, string>(),
      refToRawTypeNameMap: new Map<string, string>(),
      rawTypeNameToRefMap: new Map<string, string[]>(),
      refToSchemaMap: new Map<string, parserTypes.Schema>(),
    };
  }

  createTypeNameMapping(typeName: string, rawTypeName: string) {
    this.mappings.typeNameToRawTypeMap.set(typeName, rawTypeName);
    this.mappings.rawTypeToTypeNameMap.set(rawTypeName, typeName);
  }

  createSchemaMapping(schema: parserTypes.Schema) {
    this.mappings.refToRawTypeNameMap.set(schema.$ref, schema.typeName);
    this.mappings.refToSchemaMap.set(schema.$ref, schema);
    if (this.mappings.rawTypeNameToRefMap.get(schema.typeName)) {
      this.mappings.rawTypeNameToRefMap.get(schema.typeName)!.push(schema.$ref);
    } else {
      this.mappings.rawTypeNameToRefMap.set(schema.typeName, [schema.$ref]);
    }
  }

  parseSchema(schema: parserTypes.Schema, visitedRefs: Set<string>): boolean {
    console.log("\n\n\n");
    console.log("currentSchema: ", schema.$ref);
    console.log("visitedRefs: ", visitedRefs);
    if (visitedRefs.has(schema.$ref)) {
      if (schema._requiresRelaxedTypeJsDocTag === true) {
        return true;
      }
      return false;
    }
    visitedRefs.add(schema.$ref);
    if (schema._requiresRelaxedTypeJsDocTag === true) {
      return true;
    }
    schema._requiresRelaxedTypeJsDocTag = false;
    if (schema.rawTypeData) {
      this.parseSchemaProperty(schema.rawTypeData, schema, visitedRefs);
    }
    /**
     * Need to use `@ts-ignore` before the following if statement because the typescript
     * compiler thinks that the check for true has already happened, and points the
     * following if statement as an error (TS2367: unintentional comparison)
     * Notice that `parseScehmaProperty()` can actually modify the shcema property
     * and that makes the check valid and necessary
     */
    // @ts-ignore
    if (schema._requiresRelaxedTypeJsDocTag === true) {
      return true;
    }
    return false;
  }

  parseSchemaProperty(
    schemaProperty: parserTypes.SchemaProperty,
    schema: parserTypes.Schema,
    visitedRefs: Set<string>,
  ) {
    console.log("\nschemaProperty::", schemaProperty);
    if (parserTypes.schemaPropertyIsRelaxedType(schemaProperty)) {
      console.log("schemaPropertyIsRelaxedType");
      schema._requiresRelaxedTypeJsDocTag = true;
    } else if (parserTypes.schemaPropertyIsTypeRef(schemaProperty)) {
      console.log("schemaPropertyIsRefType");
      const newSchema = this.mappings.refToSchemaMap.get(schemaProperty.$ref);
      if (!newSchema) {
        return;
      }
      const requiresRelaxedTypeJsDocTag = this.parseSchema(
        newSchema,
        visitedRefs,
      );
      if (requiresRelaxedTypeJsDocTag) {
        schema._requiresRelaxedTypeJsDocTag = true;
      }
    } else {
      console.log("schemaPropertyHasChildern. Getting children");
      parserTypes.getSchemaPropertyChildren(schemaProperty).forEach((child) => {
        this.parseSchemaProperty(child, schema, visitedRefs);
      });
    }
  }
}
