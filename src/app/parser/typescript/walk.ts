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

export function getTypeDeclarationName(node: ts.TypeAliasDeclaration) {
  return node.getName();
}

export function getAllTypeDeclarationsMap(tsSourceFile: ts.SourceFile): Map<string, ts.TypeAliasDeclaration> {
  const allTypeDeclarations = getTypeDeclarations(tsSourceFile);
  const allTypeDeclarationsMap: Map<string, ts.TypeAliasDeclaration> = new Map();
  allTypeDeclarations.forEach((typeDeclaration) => {
    const typeDeclarationName = getTypeDeclarationName(typeDeclaration);
    if (!typeDeclarationName) {
      return;
    }
    allTypeDeclarationsMap.set(typeDeclarationName, typeDeclaration);
  });
  return allTypeDeclarationsMap;
}

/**
 * get type decalarations in a TS source file
 * @param tsSourceFile 
 * @returns 
 */
export function getTypeDeclarations(tsSourceFile: ts.SourceFile): ts.TypeAliasDeclaration[] {
  const allTypeDeclarations: ts.TypeAliasDeclaration[] = [];
  if (!tsSourceFile) {
    return allTypeDeclarations;
  }
  tsSourceFile.forEachChild((node) => {
    if (ts.Node.isTypeAliasDeclaration(node)) {
      allTypeDeclarations.push(node as ts.TypeAliasDeclaration);
    }
  });
  return allTypeDeclarations;
}

export function getInterfaceDeclarationName(node: ts.InterfaceDeclaration) {
  return node.getName();
}

export function getAllInterfaceDeclarationsMap(tsSourceFile: ts.SourceFile): Map<string, ts.InterfaceDeclaration> {
  const allInterfaceDeclarations = getInterfaceDeclarations(tsSourceFile);
  const allInterfaceDeclarationsMap: Map<string, ts.InterfaceDeclaration> = new Map();
  allInterfaceDeclarations.forEach((interfaceDeclaration) => {
    const interfaceDeclarationName = getInterfaceDeclarationName(interfaceDeclaration);
    if (!interfaceDeclarationName) {
      return;
    }
    allInterfaceDeclarationsMap.set(interfaceDeclarationName, interfaceDeclaration);
  });
  return allInterfaceDeclarationsMap;
}

/**
 * get interface decalarations in a TS source file
 * @param tsSourceFile 
 * @returns 
 */
export function getInterfaceDeclarations(tsSourceFile: ts.SourceFile): ts.InterfaceDeclaration[] {
  const allInterfaceDeclarations: ts.InterfaceDeclaration[] = [];
  if (!tsSourceFile) {
    return allInterfaceDeclarations;
  }
  tsSourceFile.forEachChild((node) => {
    if (ts.Node.isInterfaceDeclaration(node)) {
      allInterfaceDeclarations.push(node as ts.InterfaceDeclaration);
    }
  });
  return allInterfaceDeclarations;
}

export function getClassDeclarationName(node: ts.ClassDeclaration) {
  return node.getName();
}

export function getAllClassDeclarationsMap(tsSourceFile: ts.SourceFile): Map<string, ts.ClassDeclaration> {
  const allClassDeclarations = getClassDeclarations(tsSourceFile);
  const allClassDeclarationsMap: Map<string, ts.ClassDeclaration> = new Map();
  allClassDeclarations.forEach((classDeclaration) => {
    const classDeclarationName = getClassDeclarationName(classDeclaration);
    if (!classDeclarationName) {
      return;
    }
    allClassDeclarationsMap.set(classDeclarationName, classDeclaration);
  });
  return allClassDeclarationsMap;
}

/**
 * get class decalarations in a TS source file
 * @param tsSourceFile 
 * @returns 
 */
export function getClassDeclarations(tsSourceFile: ts.SourceFile): ts.ClassDeclaration[] {
  const allClassDeclarations: ts.ClassDeclaration[] = [];
  if (!tsSourceFile) {
    return allClassDeclarations;
  }
  tsSourceFile.forEachChild((node) => {
    if (ts.Node.isClassDeclaration(node)) {
      allClassDeclarations.push(node as ts.ClassDeclaration);
    }
  });
  return allClassDeclarations;
}

export function getAllImportDecalarations(tsSourceFile: ts.SourceFile): ts.ImportDeclaration[] {
  const allImportDeclarations: ts.ImportDeclaration[] = [];
  if (!tsSourceFile) {
    return allImportDeclarations;
  }
  tsSourceFile.forEachChild((node) => {
    if (ts.Node.isImportDeclaration(node)) {
      allImportDeclarations.push(node as ts.ImportDeclaration);
    }
  });

  return allImportDeclarations;
}

/**
 * get all import declarations as a map of imported library to ts.ImportDeclaration
 */
export function getAllImportDeclarationsMap(tsSourceFile: ts.SourceFile): Map<string, ts.ImportDeclaration> {
  const allImportDeclarations = getAllImportDecalarations(tsSourceFile);
  const allImportDeclarationsMap: Map<string, ts.ImportDeclaration> = new Map();
  allImportDeclarations.forEach((importDeclaration) => {
    const importLibrary = getLibraryFromImportDeclaration(importDeclaration)?.getText();
    if (!importLibrary) {
      logger.error("unable to get import library from import declaration: ", importDeclaration.getText());
      return;
    }
    allImportDeclarationsMap.set(importLibrary, importDeclaration);
  });
  return allImportDeclarationsMap;
}

function getLibraryFromImportDeclaration(importDeclaration: ts.ImportDeclaration): ts.StringLiteral | undefined {
  for (let i = importDeclaration.getChildCount() - 1; i >= 0; i--) {
    // import declarations are of the format: import * as tsMorph from "ts-morph";
    // the library name is "ts-morph", which is a string literal
    // the library name is typically the last string literal in the import declaration
    const child = importDeclaration.getChildAtIndexIfKind(i, ts.SyntaxKind.StringLiteral);
    if (child) {
      return child
    }
  }
  return undefined;
}
