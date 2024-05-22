import * as ts from "ts-morph";

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
