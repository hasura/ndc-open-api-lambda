/**
 * responsible for parsing the OpenAPI Document/Swagger Document
 * and replacing all occurrences of ${multi-line-comment-end} substring
 * with `*'/`
 */

import * as logger from "../../../util/logger";

type TypeSchema = {
  type?: string;
  description?: string;
  properties?: Record<string, TypeSchema>;
  example?: string;
};

export function fixTypesDescriptions(
  type: TypeSchema,
  schemaType: string,
  name?: string,
) {
  if (!type) {
    return;
  }

  const visited = new Set<string>();
  traverseTypes(name ? name : `${schemaType}-${name}`, type, visited);

  // const typedTypes = types as Record<string, TypeSchema>;
  // for (const currentType in typedTypes) {
  //   const visited = new Set<string>();
  //   traverseTypes(currentType, typedTypes[currentType]!, visited);
  // }
}

function traverseTypes(name: string, type: TypeSchema, visited: Set<string>) {
  if (visited.has(name)) {
    return;
  }
  visited.add(name);

  if (type.description && type.description.indexOf("*/") > -1) {
    logger.warn(
      `Encountered '*/' in description, replacing all occurrences with "*''/"`,
    );
    type.description = type.description.replaceAll("*/", `*''/`);
  }

  // console.log('type.example: ', type.example);
  // console.log('typeof of example: ', typeof type.example);
  if (
    type.example &&
    typeof type.example === "string" &&
    type.example.indexOf("*/") > -1
  ) {
    logger.warn(
      `Encountered '*/' in example, replacing all occurrences with "*''/"`,
    );
    type.description = type.example.replaceAll("*/", `*''/`);
  }

  if (type.properties) {
    for (const property in type.properties) {
      traverseTypes(property, type.properties[property]!, visited);
    }
  }
}

export function fixDescription(description?: string): string | undefined {
  if (!description) {
    return description;
  }

  if (description.indexOf("*/") > -1) {
    logger.fatal(
      `Encountered '*/' in description, replacing all occurrences with "*''/"`,
    );
    return description.replaceAll("*/", `*''/`);
  }
  return description;
}
