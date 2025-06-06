import * as parserTypes from "./schema-types";
import * as generatorTypes from "../../generator/api-ts-generator";
import * as logger from "../../../util/logger";

export function getParsedSchemaStore(
  typeNames: generatorTypes.GeneratedTypeName[],
  schemaComponents: parserTypes.Schema[],
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
    if (!parserTypes.shouldParseSchema(component)) {
      continue;
    }
    createSchemaMapping(mappings, component);
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
  try {
    parseSchemaProperty(
      parserTypes.getSchemaPropertyFromSchema(schema)!,
      schema,
      visitedRefs,
      schemaStore,
    );
  } catch (e) {
    logger.error(`Error while parsing schema '${schema.$ref}':\n${e}`);
  }
  /**
   * Need to use `@ts-ignore` before the following if statement because the typescript
   * compiler thinks that the check for true has already happened, and points the
   * following if statement as an error (TS2367: unintentional comparison)
   * Notice that `parseSchemaProperty()` can actually modify the shcema property
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
        logger.error(
          `Error while parsing Schema ${schema.$ref}\nError: Referenced Schema '${schemaProperty.$ref}' not found\nSchema: ${JSON.stringify(schema)}`,
        );
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
    logger.error(`Error while parsing schema '${schema.$ref}':\n${e}`);
  }
}
