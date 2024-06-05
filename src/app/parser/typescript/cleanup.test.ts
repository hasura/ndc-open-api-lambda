import * as assert from "assert";
import path from "path";
import * as appTypes from "../../types";
import * as fs from "fs";
import * as cleanup from "./cleanup";

const tests: {
  name: string;
  _files?: appTypes.GeneratedCode[];
  _goldenFileContent?: string;
  _functionsTsFile?: appTypes.GeneratedCode;
  _goldenFilePath?: string;
}[] = [
  {
    name: "atlassian-jira",
  },
];

describe("cleanup::fixImports", async () => {
  for (const testCase of tests) {
    before(async () => {
      const testFileDir = path.resolve(
        __dirname,
        "./test-data/cleanup-tests/",
        testCase.name,
      );

      const apiFilePath = path.resolve(testFileDir, "api");
      const functionsFilePath = path.resolve(testFileDir, "test");
      testCase._goldenFilePath = path.resolve(testFileDir, "golden-file");
      testCase._goldenFileContent = fs
        .readFileSync(testCase._goldenFilePath)
        .toString();

      const apiTsFile: appTypes.GeneratedCode = {
        fileContent: fs.readFileSync(apiFilePath).toString(),
        filePath: `${apiFilePath}.ts`,
        fileType: "api-ts",
      };

      const functionsTsFile: appTypes.GeneratedCode = {
        fileContent: fs.readFileSync(functionsFilePath).toString(),
        filePath: `${functionsFilePath}.ts`,
        fileType: "functions-ts",
      };

      testCase._files = [apiTsFile, functionsTsFile];
      testCase._functionsTsFile = functionsTsFile;
    });

    it(`${testCase.name}`, async () => {
      cleanup.fixImports(testCase._files!);

      assert.equal(
        testCase._functionsTsFile!.fileContent,
        testCase._goldenFileContent!,
      );

      // update golden file
      // fs.writeFileSync(testCase._goldenFilePath!, testCase._functionsTsFile!.fileContent);
    });
  }
});
