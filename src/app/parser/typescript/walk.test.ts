import { readFileSync, writeFileSync } from "fs";
import path from "path";
import * as ts from "ts-morph";
import * as tsWalk from "./walk";
import * as assert from "assert";

type FunctionsAndTags = {
  functionName: string;
  jsDocTags: string[];
};

type TestCase = {
  name: string;
  goldenFile: string;
  testFile: string;
  goldenFileContents?: FunctionsAndTags[];
};

const getFunctionsWithTagsTests: TestCase[] = [
  {
    name: "GoogleHome",
    testFile: "../../open-api-generator/tests/golden-files/google-home",
    goldenFile: "./testdata/walk-tests/google-home-functions-with-tags.json",
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
