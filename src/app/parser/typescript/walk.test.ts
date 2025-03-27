import { readFileSync, writeFileSync } from "fs";
import path from "path";
import * as ts from "ts-morph";
import * as tsWalk from "./walk";
import * as assert from "assert";

type TestCaseResult = {
  jsDocTags: string[];
  isSaved: boolean;
};

type TestCase = {
  name: string;
  goldenFile: string;
  testFile: string;
  goldenFileContents?: Record<string, TestCaseResult>;
};

const functionTests: TestCase[] = [
  {
    name: "GoogleHome",
    testFile: "./test-data/walk-tests/functions/got",
    goldenFile: "./test-data/walk-tests/functions/want.json",
  },
];

describe("walk::function-tests", async () => {
  for (const testCase of functionTests) {
    before(function () {
      setupTestCase(testCase);
    });

    it(`${testCase.name}`, function () {
      const project = new ts.Project();
      const tsSourceFile = project.addSourceFileAtPath(testCase.testFile);
      const functions = tsWalk.getAllFunctionsMap(tsSourceFile);
      const gotMap: Record<string, TestCaseResult> = {};

      functions.forEach((func, funcName) => {
        const jsDocTags = tsWalk.getAllJsDocTags(func).sort();
        const isSaved = tsWalk.isNodeSaved(func);
        gotMap[funcName] = { jsDocTags, isSaved };
      });

      assert.deepEqual(testCase.goldenFileContents, gotMap);

      // writeFileSync(testCase.goldenFile, JSON.stringify(gotMap, null, 2));
    });
  }
});

const variableTests: TestCase[] = [
  {
    name: "getVars",
    testFile: "./test-data/walk-tests/variables/got.ts",
    goldenFile: "./test-data/walk-tests/variables/want.json",
  },
];

describe("walk::variable-tests", async () => {
  for (const testCase of variableTests) {
    before(function () {
      setupTestCase(testCase);
    });

    it(`${testCase.name}`, function () {
      const project = new ts.Project();
      const tsSourceFile = project.addSourceFileAtPath(testCase.testFile);
      const vars = tsWalk.getAllVariablesMap(tsSourceFile);
      const gotMap: Record<string, TestCaseResult> = {};

      vars.forEach((variable, variableName) => {
        const jsDocTags = tsWalk.getAllJsDocTags(variable).sort();
        const isSaved = tsWalk.isNodeSaved(variable);
        gotMap[variableName] = { jsDocTags, isSaved };
      });

      assert.deepEqual(testCase.goldenFileContents, gotMap);

      // writeFileSync(testCase.goldenFile, JSON.stringify(gotMap, null, 2));
    });
  }
});

const userDefinedTypesTests: TestCase[] = [{  
  name: "getUserDefinedTypesTests",
  testFile: "./test-data/walk-tests/types/got.ts",
  goldenFile: "./test-data/walk-tests/types/want.json",
}];

type UserDefinedTypeTestResult = {
  jsDocTags: string[];
  isSaved: boolean;
  type: "type" | "interface" | "class";
};

describe("walk::user-defined-types-tests", async () => {
  for (const testCase of userDefinedTypesTests) {
    before(function () {
      setupTestCase(testCase);
    });

    it(`${testCase.name}`, function () {
      const project = new ts.Project();
      const tsSourceFile = project.addSourceFileAtPath(testCase.testFile);
      
      // user defined types
      const types = tsWalk.getAllTypeDeclarationsMap(tsSourceFile);
      const interfaces = tsWalk.getAllInterfaceDeclarationsMap(tsSourceFile);
      const classes = tsWalk.getAllClassDeclarationsMap(tsSourceFile);
      
      const gotMap: Record<string, UserDefinedTypeTestResult> = {};

      types.forEach((type, typeName) => {
        const jsDocTags = tsWalk.getAllJsDocTags(type).sort();
        const isSaved = tsWalk.isNodeSaved(type);
        gotMap[typeName] = { jsDocTags, isSaved, type: "type" };
      });

      interfaces.forEach((interfaceDecl, interfaceName) => {
        const jsDocTags = tsWalk.getAllJsDocTags(interfaceDecl).sort();
        const isSaved = tsWalk.isNodeSaved(interfaceDecl);
        gotMap[interfaceName] = { jsDocTags, isSaved, type: "interface" };
      });

      classes.forEach((classDecl, className) => {
        const jsDocTags = tsWalk.getAllJsDocTags(classDecl).sort();
        const isSaved = tsWalk.isNodeSaved(classDecl);
        gotMap[className] = { jsDocTags, isSaved, type: "class" };
      });

      assert.deepEqual(testCase.goldenFileContents, gotMap);

      // writeFileSync(testCase.goldenFile, JSON.stringify(gotMap, null, 2));
    });
  }
});

const importDeclarationsTests: TestCase[] = [{  
  name: "getImportDeclarationTests",
  testFile: "./test-data/walk-tests/imports/got",
  goldenFile: "./test-data/walk-tests/imports/want.json",
}];

describe("walk::import-declarations-tests", async () => {
  for (const testCase of importDeclarationsTests) {
    before(function () {
      setupTestCase(testCase);
    });

    it(`${testCase.name}`, function () {
      const project = new ts.Project();
      const tsSourceFile = project.addSourceFileAtPath(testCase.testFile);

      const importsMap = tsWalk.getAllImportDeclarationsMap(tsSourceFile);
      const gotImports: Record<string, string> = {};

      importsMap.forEach((importDeclaration, importName) => {
        gotImports[importName] = importDeclaration.getText();
      });

      assert.deepEqual(testCase.goldenFileContents, gotImports);

      // writeFileSync(testCase.goldenFile, JSON.stringify(gotImports, null, 2));
    });
  }
});

function setupTestCase(testCase: TestCase) {
  testCase.testFile = path.resolve(__dirname, testCase.testFile);
  testCase.goldenFile = path.resolve(__dirname, testCase.goldenFile);
  testCase.goldenFileContents = JSON.parse(
    readFileSync(testCase.goldenFile).toString(),
  );
}
