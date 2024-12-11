import * as ts from "ts-morph";
import * as logger from "../../../util/logger"

export function getAllFunctionsMap(tsSourceFile: ts.SourceFile): Map<string, ts.FunctionDeclaration> {
  const allFunctions = getAllFunctions(tsSourceFile);
  const allFunctionsMap: Map<string, ts.FunctionDeclaration> = new Map();
  allFunctions.forEach((func) => {
    const functionName = getFunctionName(func);
    if (!functionName) {
      return;
    }
    allFunctionsMap.set(functionName, func);
  });
  return allFunctionsMap;
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

export function getAllJsDocTags(node: ts.Node): string[] {
  const allJSDocs = getAllJSDocs(node);
  const allTags: string[] = [];
  if (!allJSDocs) {
    return allTags;
  }

  for (let i =0; i < allJSDocs.length; i++) {
    const jsDoc = allJSDocs[i];
    if (!jsDoc) {
      continue;
    }
    const tags = extractTagsFromJsDocs(jsDoc);
    allTags.push(...tags);
    
  }
  return allTags;
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

function extractTagsFromJsDocs(node: ts.JSDoc) {
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

export function isNodeSaved(node: ts.Node): boolean {
  const allTags = getAllJsDocTags(node);
  return allTags.includes("save")
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
