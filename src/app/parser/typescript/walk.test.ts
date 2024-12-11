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

function setupTestCase(testCase: TestCase) {
  testCase.testFile = path.resolve(__dirname, testCase.testFile);
  testCase.goldenFile = path.resolve(__dirname, testCase.goldenFile);
  testCase.goldenFileContents = JSON.parse(
    readFileSync(testCase.goldenFile).toString(),
  );
}
