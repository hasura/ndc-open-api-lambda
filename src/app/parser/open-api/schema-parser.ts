import * as swaggerTypescriptApi from "swagger-typescript-api";
import * as parserTypes from "./types";
import * as generatorTypes from "../../generator/types";
import * as logger from "../../../util/logger";

export function getParsedSchemaStore(
  typeNames: generatorTypes.GeneratedTypeName[],
  schemaComponents: swaggerTypescriptApi.SchemaComponent[],
): ParsedSchemaStore {
  const mappings: Mappings = {
    rawTypeToTypeNameMap: new Map<string, string>(),
    typeNameToRawTypeMap: new Map<string, string>(),
    refToRawTypeNameMap: new Map<string, string>(),
    rawTypeNameToRefMap: new Map<string, string[]>(),
    refToSchemaMap: new Map<string, parserTypes.Schema>(),
  };

  for (const typeName of typeNames) {
    createTypeNameMapping(mappings, typeName);
  }

  for (const component of schemaComponents) {
    /**
     * Need to use @ts-ignore in the following lines because the typescript
     * compiler does not think that component can be correctly cast to parserTypes.Schema
     */
    // @ts-ignore
    if (!shouldParseScehma(component as parserTypes.Schema)) {
      continue;
    }
    // @ts-ignore
    createSchemaMapping(mappings, component as parserTypes.Schema);
  }

  const schemaStore = new ParsedSchemaStore(mappings);

  schemaStore.getAllSchemas().forEach((schema) => {
    parseSchema(schema, new Set<string>(), schemaStore);
  });

  return schemaStore;
}

type Mappings = {
  rawTypeToTypeNameMap: Map<string, string>;
  typeNameToRawTypeMap: Map<string, string>;
  refToRawTypeNameMap: Map<string, string>;
  rawTypeNameToRefMap: Map<string, string[]>; // in some open api docs, same raw type name could map to multiple refs
  refToSchemaMap: Map<string, parserTypes.Schema>;
};

export class ParsedSchemaStore {
  mappings: Mappings;

  constructor(mappings: Mappings) {
    this.mappings = mappings;
  }

  getAllSchemas(): parserTypes.Schema[] {
    return Array.from(this.mappings.refToSchemaMap.values());
  }

  getSchemaByRef(ref: string): parserTypes.Schema | undefined {
    return this.mappings.refToSchemaMap.get(ref);
  }

  getSchemaByRawTypeName(rawTypeName: string): parserTypes.Schema | undefined {
    const ref = this.mappings.rawTypeNameToRefMap.get(rawTypeName);
    if (!ref || ref.length === 0) {
      return undefined;
    }
    return this.getSchemaByRef(ref[0]!);
  }

  getSchemaByTypeName(typeName: string): parserTypes.Schema | undefined {
    const rawTypeName = this.mappings.typeNameToRawTypeMap.get(typeName);
    if (!rawTypeName) {
      return undefined;
    }
    return this.getSchemaByRawTypeName(rawTypeName);
  }

  getAllTypeNames(): string[] {
    return Array.from(this.mappings.typeNameToRawTypeMap.keys());
  }

  getTypeName(schema: parserTypes.Schema): string | undefined {
    return this.mappings.rawTypeToTypeNameMap.get(schema.typeName);
  }
}

function createTypeNameMapping(
  mappings: Mappings,
  typeName: generatorTypes.GeneratedTypeName,
) {
  if (typeName.schemaType === "enum-key") {
    return;
  }
  mappings.typeNameToRawTypeMap.set(
    typeName.typeName,
    typeName.rawTypeName ?? typeName.typeName,
  );
  mappings.rawTypeToTypeNameMap.set(
    typeName.rawTypeName ?? typeName.typeName,
    typeName.typeName,
  );
}

function createSchemaMapping(mappings: Mappings, schema: parserTypes.Schema) {
  mappings.refToRawTypeNameMap.set(schema.$ref, schema.typeName);
  mappings.refToSchemaMap.set(schema.$ref, schema);
  if (mappings.rawTypeNameToRefMap.get(schema.typeName)) {
    mappings.rawTypeNameToRefMap.get(schema.typeName)!.push(schema.$ref);
  } else {
    mappings.rawTypeNameToRefMap.set(schema.typeName, [schema.$ref]);
  }
}

function shouldParseScehma(component: parserTypes.Schema) {
  /**
   * We don't want to parse #/components/examples/ because
   * 1. they are not used in code
   * 2. too many examples can slow down the parsing
   */
  if (component.$ref.startsWith("#/components/examples/")) {
    return false;
  }
  return true;
}

function parseSchema(
  schema: parserTypes.Schema,
  visitedRefs: Set<string>,
  schemaStore: ParsedSchemaStore,
): boolean {
  if (visitedRefs.has(schema.$ref)) {
    return schema._requiresRelaxedTypeJsDocTag ?? false;
  }
  visitedRefs.add(schema.$ref);
  if (schema._requiresRelaxedTypeJsDocTag === true) {
    return true;
  }
  schema._requiresRelaxedTypeJsDocTag = false;
  if (parserTypes.getSchemaPropertyFromSchema(schema)) {
    parseSchemaProperty(
      parserTypes.getSchemaPropertyFromSchema(schema)!,
      schema,
      visitedRefs,
      schemaStore,
    );
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

function parseSchemaProperty(
  schemaProperty: parserTypes.SchemaProperty,
  schema: parserTypes.Schema,
  visitedRefs: Set<string>,
  schemaStore: ParsedSchemaStore,
) {
  try {
    if (parserTypes.schemaPropertyIsRelaxedType(schemaProperty)) {
      schema._requiresRelaxedTypeJsDocTag = true;
    } else if (parserTypes.schemaPropertyIsTypeRef(schemaProperty)) {
      const newSchema = schemaStore.getSchemaByRef(schemaProperty.$ref);
      if (!newSchema) {
        return;
      }
      const requiresRelaxedTypeJsDocTag = parseSchema(
        newSchema,
        visitedRefs,
        schemaStore,
      );
      if (requiresRelaxedTypeJsDocTag) {
        // if a child in this requires an @allowRelaxedType tag,
        // then the parent requires it too
        schema._requiresRelaxedTypeJsDocTag = true;
      }
    } else {
      parserTypes.getSchemaPropertyChildren(schemaProperty).forEach((child) => {
        parseSchemaProperty(child, schema, visitedRefs, schemaStore);
      });
    }
  } catch (e) {
    if (e instanceof Error) {
      logger.error(`Error while parsing schema '${schema.$ref}':\n${e.message}`);
    }
    logger.error(`Error while parsing schema '${schema.$ref}':\n${e}`);
  }
}
