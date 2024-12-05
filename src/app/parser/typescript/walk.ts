import * as ts from "ts-morph";
import * as logger from "../../../util/logger"

export type FunctionWithTagsAsStringArray = {
  function: ts.FunctionDeclaration;
  tags: string[];
};

/**
 *
 * @param tsSourceFile
 * @returns map of function name to type FunctionWithTagsAsStringArray
 */
export function getFunctionsWithJSDocTags(
  tsSourceFile: ts.SourceFile,
): Map<string, FunctionWithTagsAsStringArray> {
  const functionsWithJSDocTags = new Map<
    string,
    FunctionWithTagsAsStringArray
  >();
  const allFunctions = getAllFunctions(tsSourceFile);
  allFunctions.forEach((func) => {
    const functionName = getFunctionName(func);
    const allJSDocs = getAllJSDocs(func);
    let tags: string[] = [];
    allJSDocs.forEach((jsDoc) => {
      tags = getAllJSDocsTagsAsStringArray(jsDoc);
    });
    functionsWithJSDocTags.set(functionName!, { function: func, tags: tags });
  });
  return functionsWithJSDocTags;
}

export function getAllFunctions(
  tsSourceFile: ts.SourceFile,
): ts.FunctionDeclaration[] {
  const allFunctions: ts.FunctionDeclaration[] = [];
  if (!tsSourceFile) {
    return allFunctions;
  }
  tsSourceFile.forEachChild((node) => {
    if (ts.Node.isFunctionDeclaration(node)) {
      allFunctions.push(node as ts.FunctionDeclaration);
    }
  });
  return allFunctions;
}

export function getAllJSDocs(node: ts.Node) {
  const allJSDocTags: ts.JSDoc[] = [];
  if (!node) {
    return allJSDocTags;
  }
  node.getChildren().forEach((childNode) => {
    if (ts.Node.isJSDoc(childNode)) {
      allJSDocTags.push(childNode as ts.JSDoc);
    }
  });
  return allJSDocTags;
}

export function getAllJSDocsTagsAsStringArray(node: ts.JSDoc) {
  const allTags: string[] = [];
  if (!node) {
    return allTags;
  }
  node.getTags()?.forEach((tag) => {
    allTags.push(tag.getTagName());
  });
  return allTags;
}

export function getFunctionName(node: ts.FunctionDeclaration) {
  return node.getName();
}

export function isSavedFunction(func: FunctionWithTagsAsStringArray): boolean {
  return func.tags.indexOf("save") > -1;
}

export function isNodeSaved(node: ts.Node): boolean {
  const allJSDocs = getAllJSDocs(node);
  if (!allJSDocs) {
    return false;
  }

  for (let i =0; i < allJSDocs.length; i++) {
    const jsDoc = allJSDocs[i];
    if (!jsDoc) {
      continue;
    }
    const allTags = getAllJSDocsTagsAsStringArray(jsDoc);
    if (allTags.includes("save")) {
      return true;
    }
  }
  return false;
}

/**
 * get all constants and variables declared in the global scope of a TS source file
 * @param tsSourceFile 
 * @returns 
 */
export function getAllVariables(tsSourceFile: ts.SourceFile): ts.VariableStatement[] {
  const allVariables: ts.VariableStatement[] = [];
  if (!tsSourceFile) {
    return allVariables;
  }
  tsSourceFile.forEachChild((node) => {
    if (ts.Node.isVariableStatement(node)) {
      allVariables.push(node as ts.VariableStatement);
    }
  });
  return allVariables;
}

/**
 * returns all constants and variables as a map of variable name to ts.VariableStatement
 * @param tsSourceFile 
 * @returns 
 */
export function getAllVariablesMap(tsSourceFile: ts.SourceFile): Map<string, ts.VariableStatement> {
  const allVariables = getAllVariables(tsSourceFile);
  const allVariablesMap: Map<string, ts.VariableStatement> = new Map();
  allVariables.forEach((variable) => {
    const variableName = getVariableName(variable);
    if (!variableName) {
      return;
    }
    allVariablesMap.set(variableName, variable);
  });
  return allVariablesMap;
}


export function getVariableName(node: ts.VariableStatement) {
  if (!node || !node.getDeclarations()) {
    return undefined;
  }
  if (node.getDeclarations().length === 0) {
    logger.error('Variable name not found in declaration: ', node.getFullText());
    return undefined;
  } else if (node.getDeclarations().length > 1) {
    logger.warn('Multiple variable declarations are not supported for `@save`. Found in node: ', node.getFullText());
    return undefined;
  }
  return node.getDeclarations()[0]!.getName();
}
