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
    walk.getAllFunctionsMap(staleTsSourceFile);
  const freshSourceFunctions =
    walk.getAllFunctionsMap(freshTsSourceFile);

  staleSourceFunctions.forEach((func, funcName) => {
    if (!walk.isNodeSaved(func)) {
      return;
    }

    const freshFunction = freshSourceFunctions.get(funcName);

    // case 1: @save function exists in the fresh source file
    if (freshFunction) {
      // in this case, the function should be replaced with the stale function
      freshFunction.replaceWithText(func.getFullText());
    } else {
      // case 2: @save function does not exist in the new/fresh ts source file
      // in this case, we add the @save function to the fresh ts source file
      freshTsSourceFile.addStatements(func.getFullText());
    }
  });
}

/**
 * this function preserves @save variables from a stale source file to a new/fresh source file
 * @param staleTsSourceFile the old TS source, which has the @save variables that should be preserved
 * @param freshTsSourceFile the new TS source, to which the @save variables will copied over to
 */
export function preserveSavedVariables(
  staleTsSourceFile: tsMorph.SourceFile,
  freshTsSourceFile: tsMorph.SourceFile,
) {
  const staleSourceVariables = walk.getAllVariablesMap(staleTsSourceFile);
  const freshSourceVariables = walk.getAllVariablesMap(freshTsSourceFile);

  staleSourceVariables.forEach((staleVariable, staleVariableName) => {
    if (!walk.isNodeSaved(staleVariable)) {
      return;
    }

    const freshVariable = freshSourceVariables.get(staleVariableName);

    // case 1: @save variable exists in the fresh source file
    if (freshVariable) {
      // in this case, the variable should be replaced with the stale variable
      freshVariable.replaceWithText(staleVariable.getFullText());
    } 
  else {
      // case 2: @save variable does not exist in the new/fresh ts source file
      // in this case, we add the @save variable to the fresh ts source file
      freshTsSourceFile.addStatements(staleVariable.getFullText());
    }
  });
}
