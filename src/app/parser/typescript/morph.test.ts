import * as morph from "./morph";
import * as ts from "ts-morph";
import * as assert from "assert";
import * as fs from "fs";
import path from "path";
import * as prettier from "prettier";

type TestCase = {
  name: string;
  directory: string;
  staleSourceFile?: ts.SourceFile;
  freshSourceFile?: ts.SourceFile;
  mergedFileContents?: string;
};

const functionTests: TestCase[] = [
  {
    name: "Add and Replace",
    directory: "./test-data/morph-tests/functions/add-and-replace/",
  },
  {
    name: "No change",
    directory: "./test-data/morph-tests/functions/no-change/",
  },
];

describe("morph::preserveSavedFunctions", async () => {
  for (const testCase of functionTests) {
    before(function () {
      setupTest(testCase);
    });

    it(testCase.name, async () => {
      morph.preserveSavedFunctions(
        testCase.staleSourceFile!,
        testCase.freshSourceFile!,
      );

      const gotStr = await prettier.format(
        testCase.freshSourceFile?.getFullText()!,
        {
          parser: "typescript",
        },
      );

      assert.equal(testCase.mergedFileContents, gotStr);

      // uncomment to update merged golden file
      // fs.writeFileSync(path.resolve(testCase.directory, "merged.ts"), gotStr);
    });
  }
});

const variableTests: TestCase[] = [
  {
    name: "Add and Replace",
    directory: "./test-data/morph-tests/variables/add-and-replace/",
  },
  {
    name: "No change",
    directory: "./test-data/morph-tests/variables/no-change/",
  },
];

describe("morph::preserveSavedVariables", async () => {
  for (const testCase of variableTests) {
    before(function () {
      setupTest(testCase);
    });

    it(testCase.name, async () => {
      morph.preserveSavedVariables(
        testCase.staleSourceFile!,
        testCase.freshSourceFile!,
      );

      const gotStr = await prettier.format(
        testCase.freshSourceFile?.getFullText()!,
        {
          parser: "typescript",
        },
      );

      assert.equal(testCase.mergedFileContents, gotStr);

      // uncomment to update merged golden file
      // fs.writeFileSync(path.resolve(testCase.directory, "merged.ts"), gotStr);
    });
  }
});

const userDefinedTypesTests: TestCase[] = [
  {
    name: "Add and Replace",
    directory: "./test-data/morph-tests/types/add-and-replace/",
  },
  {
    name: "No change",
    directory: "./test-data/morph-tests/types/no-change/",
  },
];

describe("morph::user-defined-types", async () => {
  for (const testCase of userDefinedTypesTests) {
    before(function () {
      setupTest(testCase);
    });

    it(testCase.name, async () => {
      morph.preserveSavedTypes(
        testCase.staleSourceFile!,
        testCase.freshSourceFile!,
      );

      morph.preserveSavedInterfaces(
        testCase.staleSourceFile!,
        testCase.freshSourceFile!,
      );

      morph.preserveSavedClasses(
        testCase.staleSourceFile!,
        testCase.freshSourceFile!,
      );

      const gotStr = await prettier.format(
        testCase.freshSourceFile?.getFullText()!,
        {
          parser: "typescript",
        },
      );

      assert.equal(testCase.mergedFileContents, gotStr);

      // uncomment to update merged golden file
      // fs.writeFileSync(path.resolve(testCase.directory, "merged.ts"), gotStr);
    });
  }
});

function setupTest(testCase: TestCase) {
  testCase.directory = path.resolve(__dirname, testCase.directory);
  const staleProject = new ts.Project();
  testCase.staleSourceFile = staleProject.addSourceFileAtPath(
    path.resolve(testCase.directory, "stale.ts"),
  );

  const freshProject = new ts.Project();
  testCase.freshSourceFile = freshProject.addSourceFileAtPath(
    path.resolve(testCase.directory, "fresh.ts"),
  );

  testCase.mergedFileContents = fs
    .readFileSync(path.resolve(testCase.directory, "merged.ts"))
    .toString();
}