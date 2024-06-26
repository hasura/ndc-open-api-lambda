/**
 * responsible for manipulating the TS AST
 */

import * as tsMorph from "ts-morph";
import * as walk from "./walk";

/**
 * this function preserves @save functions from a stale source file to a new/fresh source file
 * @param staleTsSourceFile the old TS source, which has the @save functions that should be preserved
 * @param freshTsSourceFile the new TS source, to which the @save functions will copied over to
 */
export function preserveSavedFunctions(
  staleTsSourceFile: tsMorph.SourceFile,
  freshTsSourceFile: tsMorph.SourceFile,
) {
  const staleSourceFunctions =
    walk.getFunctionsWithJSDocTags(staleTsSourceFile);
  const freshSourceFunctions =
    walk.getFunctionsWithJSDocTags(freshTsSourceFile);

  staleSourceFunctions.forEach((value, key) => {
    if (!walk.isSavedFunction(value)) {
      return;
    }

    // case 1: @save function exists in the fresh source file
    if (freshSourceFunctions.has(key)) {
      // in this case, the function should be replaced with the stale function
      const freshFunction = freshSourceFunctions.get(key);
      freshFunction?.function.replaceWithText(value.function.getFullText());
    } else {
      // case 2: @save function does not exist in the new/fresh ts source file
      // in this case, we add the @save function to the fresh ts source file
      freshTsSourceFile.addStatements(value.function.getFullText());
    }
  });
}
