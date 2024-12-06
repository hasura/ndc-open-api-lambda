import { readFileSync, writeFileSync } from "fs";
import path from "path";
import * as ts from "ts-morph";
import * as tsWalk from "./walk";
import * as assert from "assert";

type FunctionsAndTags = {
  functionName: string;
  jsDocTags: string[];
};

type FunctionTestCase = {
  name: string;
  goldenFile: string;
  testFile: string;
  goldenFileContents?: FunctionsAndTags[];
};

const getFunctionsWithTagsTests: FunctionTestCase[] = [
  {
    name: "GoogleHome",
    testFile: "../../../../tests/test-data/golden-files/google-home",
    goldenFile: "./test-data/walk-tests/google-home-functions-with-tags.json",
  },
];

describe("walk::getFunctionsWithJSDocTags", async () => {
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
      const gotMap = tsWalk.getFunctionsWithJSDocTags(tsSourceFile);
      const gotArray: FunctionsAndTags[] = [];

      gotMap.forEach((value, key) => {
        gotArray.push({
          functionName: key,
          jsDocTags: value.tags,
        });
      });

      assert.deepEqual(testCase.goldenFileContents, gotArray);

      // writeFileSync(testCase.goldenFile, JSON.stringify(gotArray));
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