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
  const staleSourceFunctions = walk.getAllFunctionsMap(staleTsSourceFile);
  const freshSourceFunctions = walk.getAllFunctionsMap(freshTsSourceFile);

  preserveNode(staleSourceFunctions, freshSourceFunctions, freshTsSourceFile);
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

  preserveNode(staleSourceVariables, freshSourceVariables, freshTsSourceFile);
}

export function preserveSavedTypes(
  staleTsSourceFile: tsMorph.SourceFile,
  freshTsSourceFile: tsMorph.SourceFile,
) {
  const staleSourceTypes = walk.getAllTypeDeclarationsMap(staleTsSourceFile);
  const freshSourceTypes = walk.getAllTypeDeclarationsMap(freshTsSourceFile);

  preserveNode(staleSourceTypes, freshSourceTypes, freshTsSourceFile);
}

export function preserveSavedInterfaces(
  staleTsSourceFile: tsMorph.SourceFile,
  freshTsSourceFile: tsMorph.SourceFile,
) {
  const staleSourceInterfaces = walk.getAllInterfaceDeclarationsMap(staleTsSourceFile);
  const freshSourceInterfaces = walk.getAllInterfaceDeclarationsMap(freshTsSourceFile);

  preserveNode(staleSourceInterfaces, freshSourceInterfaces, freshTsSourceFile);
}

export function preserveSavedClasses(
  staleTsSourceFile: tsMorph.SourceFile,
  freshTsSourceFile: tsMorph.SourceFile,
) {
  const staleSourceClasses = walk.getAllClassDeclarationsMap(staleTsSourceFile);
  const freshSourceClasses = walk.getAllClassDeclarationsMap(freshTsSourceFile);

  preserveNode(staleSourceClasses, freshSourceClasses, freshTsSourceFile);
}

export function preserveImportDeclarations(
  staleTsSourceFile: tsMorph.SourceFile,
  freshTsSourceFile: tsMorph.SourceFile,
) {
  const staleSourceImports = walk.getAllImportDeclarationsMap(staleTsSourceFile);
  const freshSourceImports = walk.getAllImportDeclarationsMap(freshTsSourceFile);

  staleSourceImports.forEach((staleNode, staleNodeName) => {
    const freshNode = freshSourceImports.get(staleNodeName);

    if (freshNode) {
      // this import statement already exists in the fresh source file
      // replace it with the stale import statement
      freshNode.replaceWithText(staleNode.getText());
    } else {
      // this import statement does not exist in the fresh source file
      // add it to the fresh source
      freshTsSourceFile.insertStatements(0, staleNode.getText());
    }
  })
}


/**
 * this function preservers nodes that are marked with `@save` annotation in the stale source file
 * if a saved node is missing in the fresh source file, it will be copied to it
 * @param staleNodes 
 * @param freshNodes 
 * @param freshTsSourceFile 
 */
function preserveNode(staleNodes: Map<string, tsMorph.Node>, freshNodes: Map<string, tsMorph.Node>, freshTsSourceFile: tsMorph.SourceFile,) {
  staleNodes.forEach((staleNode, staleNodeName) => {
    if (!walk.isNodeSaved(staleNode)) {
      return;
    }
    const freshNode = freshNodes.get(staleNodeName);

    // case 1: @save node exists in the fresh source file
    if (freshNode) {
      // in this case, the node should be replaced with the stale node
      freshNode.replaceWithText(staleNode.getFullText());
    } 
  else {
      // case 2: @save node does not exist in the new/fresh ts source file
      // in this case, we add the @save node to the fresh ts source file
      freshTsSourceFile.addStatements(staleNode.getFullText());
    }
  });

}
