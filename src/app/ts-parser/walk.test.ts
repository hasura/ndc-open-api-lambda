import { readFileSync, writeFileSync } from "fs";
import path from "path";
import * as ts from "typescript";
import * as tsWalk from "./walk";
import * as assert from "assert";

type FunctionsAndTags = {
  functionName: string,
  jsDocTags: string[],
}

type TestCase = {
  name: string,
  goldenFile: string,
  testFile: string,
  testFileContents?: string,
  goldenFileContents?: FunctionsAndTags[],
}

const getFunctionsWithTagsTests: TestCase[] = [
  {
    name: "GoogleHome",
    testFile: "../open-api-generator/tests/golden-files/google-home",
    goldenFile: "./testdata/walk-tests/google-home-functions-with-tags.json"
  }
]

describe("Get Functions with JSDoc Tags", async() => {
  for (const testCase of getFunctionsWithTagsTests) {
    before (function() {
      testCase.testFile = path.resolve(__dirname, testCase.testFile);
      testCase.goldenFile = path.resolve(__dirname, testCase.goldenFile);
      testCase.testFileContents = readFileSync(testCase.testFile).toString();
      testCase.goldenFileContents = JSON.parse(readFileSync(testCase.goldenFile).toString());
    });

    it(`${testCase.name}`, function() {
      const tsSourceFile = ts.createSourceFile(
        testCase.testFile,
        testCase.testFileContents!,
        ts.ScriptTarget.Latest,
        true, 
      );

      const gotMap = tsWalk.getFunctionsWithJSDocTags(tsSourceFile);
      const gotArray: FunctionsAndTags[] = [];

      gotMap.forEach((value, key) => {
        gotArray.push({
          functionName: key,
          jsDocTags: value.tags,
        })
      });
      
      assert.deepEqual(testCase.goldenFileContents, gotArray);

      // writeFileSync(testCase.goldenFile, JSON.stringify(gotArray));
    });
  }
});
