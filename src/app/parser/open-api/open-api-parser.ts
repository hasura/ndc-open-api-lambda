/**
 * responsible for parsing the OpenAPI Document/Swagger Document
 * and replacing all occurrences of ${multi-line-comment-end} substring
 * with `*''/`
 */

import * as logger from "../../../util/logger";

export function fixDescription(description?: string): string | undefined {
  if (!description) {
    return description;
  }

  if (description.indexOf("*/") > -1) {
    logger.warn(
      `Encountered '*/' in description, replacing all occurrences with "*''/"`,
    );
    return description.replaceAll("*/", `*''/`);
  }
  return description;
}
