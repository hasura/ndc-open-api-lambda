import { readFileSync, writeFileSync } from "fs";
import path from "path";
import * as ts from "ts-morph";
import * as tsWalk from "./walk";
import * as assert from "assert";

type TestCaseResult = {
  jsDocTags: string[];
  isSaved: boolean;
};

type FunctionTestCase = {
  name: string;
  goldenFile: string;
  testFile: string;
  goldenFileContents?: Record<string, TestCaseResult>;
};

const getFunctionsWithTagsTests: FunctionTestCase[] = [
  {
    name: "GoogleHome",
    testFile: "./test-data/walk-tests/function-tests/got",
    goldenFile: "./test-data/walk-tests/function-tests/want.json",
  },
];

describe("walk::function-tests", async () => {
  for (const testCase of getFunctionsWithTagsTests) {
    before(function () {
      testCase.testFile = path.resolve(__dirname, testCase.testFile);
      testCase.goldenFile = path.resolve(__dirname, testCase.goldenFile);
      testCase.goldenFileContents = JSON.parse(
        readFileSync(testCase.goldenFile).toString(),
      );
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

type TsVariables = {
  name: string;
  isSaved: boolean;
}

type TestCase = {
  name: string;
  goldenFile: string;
  testFile: string;
  goldenFileContents?: string;
};

const getVars: TestCase[] = [
  {
    name: "getVars",
    testFile: "./test-data/walk-tests/variable-tests/got.ts",
    goldenFile: "./test-data/walk-tests/variable-tests/want.json",
  },
];

describe("walk::getVars", async () => {
  for (const testCase of getVars) {
    before(function () {
      testCase.testFile = path.resolve(__dirname, testCase.testFile);
      testCase.goldenFile = path.resolve(__dirname, testCase.goldenFile);
      testCase.goldenFileContents = readFileSync(testCase.goldenFile).toString();
    });

    it(`${testCase.name}`, function () {
      const project = new ts.Project();
      const tsSourceFile = project.addSourceFileAtPath(testCase.testFile);
      const gotVars = tsWalk.getAllVariables(tsSourceFile);

      const gotArr: TsVariables[] = [];

      gotVars.forEach((v) => {
        gotArr.push({
          name: tsWalk.getVariableName(v) ?? "",
          isSaved: tsWalk.isNodeSaved(v),
        });
      });

      sortTsVariables(gotArr);

      const wantArr: TsVariables[] = JSON.parse(testCase.goldenFileContents!!);

      assert.deepEqual(wantArr, gotArr);

      // writeFileSync(testCase.goldenFile, JSON.stringify(gotArr, null, 2));
    });
  }
});

function sortTsVariables(arr: TsVariables[]) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i]!!.name > arr[j]!!.name) {
        const temp: TsVariables = arr[i]!!;
        arr[i] = arr[j]!!;
        arr[j]!! = temp;
      }
    }
  }
}