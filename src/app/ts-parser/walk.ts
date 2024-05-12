import * as ts from "typescript";

export type FunctionWithTagsAsStringArray = {
  function: ts.FunctionDeclaration,
  tags: string[],
}

export function getFunctionsWithJSDocTags(tsSourceFile: ts.SourceFile): Map<string, FunctionWithTagsAsStringArray> {
  const functionsWithJSDocTags = new Map<string, FunctionWithTagsAsStringArray>();
  const allFunctions = getAllFunctions(tsSourceFile);
  allFunctions.forEach((func) => {
    const functionName = getFunctionName(func);
    const allJSDocs = getAllJSDocs(func);
    allJSDocs.forEach((jsDoc) => {
      const tags = getAllJSDocsTagsAsStringArray(jsDoc);
      functionsWithJSDocTags.set(functionName!, {function: func, tags: tags});
    });
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
    if (ts.isFunctionDeclaration(node)) {
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
    if (ts.isJSDoc(childNode)) {
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
  node.tags?.forEach((tag) => {
    allTags.push(tag.tagName.escapedText.toString());
  });
  return allTags;
}

export function getFunctionName(node: ts.FunctionDeclaration) {
  return node.name?.escapedText;
}
