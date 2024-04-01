import * as assert from "assert";
import * as fs from "fs";
import * as path from "path";
import { generateRandomDir } from "../../../../tests/testutils";
import { generateCode } from "..";

const tests = [
  {
    name: "GenerateCode_DemoBlogApi",
    oasFile: "./oas-docs/demo-blog-api.json",
    goldenFile: "./golden-files/demo-blog-api",
    outDir: "",
    expected: "",
    headers: "",
  },
  {
    name: "GenerateCode_PatientSearch",
    oasFile: "./oas-docs/patient-search.json",
    goldenFile: "./golden-files/patient-search",
  },
  {
    name: 'GenerateCode_Petstore',
    oasFile: './oas-docs/petstore.yaml',
    goldenFile: './golden-files/petstore',
  },
  {
    name: "GenerateCode_DemoBlogApi_headers",
    oasFile: "./oas-docs/demo-blog-api.json",
    goldenFile: "./golden-files/demo-blog-api-headers",
    headers: "auth=some-token=1&type=json",
  },
  {
    name: "GenerateCode_PatientSearch_headers",
    oasFile: "./oas-docs/patient-search.json",
    goldenFile: "./golden-files/patient-search-headers",
    headers: "auth=some-token=1"
  },
  {
    name: 'GenerateCode_Petstore_headers',
    oasFile: './oas-docs/petstore.yaml',
    goldenFile: './golden-files/petstore-headers',
    headers: "auth=some-token=1&type=json,xml,text",
  },
];

describe("GenerateCode", async () => {
  for (const testCase of tests) {
    before(function () {
      const outDir = generateRandomDir(
        path.resolve(__dirname, `./_temp/${testCase.name}`),
      );
      testCase.outDir = outDir;
      testCase.oasFile = path.resolve(__dirname, testCase.oasFile);
      testCase.goldenFile = path.resolve(__dirname, testCase.goldenFile);
      testCase.expected = fs.readFileSync(testCase.goldenFile, "utf8");
    });

    it(testCase.name, async () => {
      const got = await generateCode(testCase.oasFile, `${testCase.outDir}`, true, testCase.headers, undefined);
      fs.writeFileSync(path.resolve(`${testCase.outDir}`, "functions.ts"), got);
      assert.equal(got, testCase.expected);

      // uncomment the following to update golden file
      // if (testCase.name === 'GenerateCode_Petstore') {
        // fs.writeFileSync(testCase.goldenFile, got);
      // }
    });

    after(function () {
      // remove generated api.ts files
      // comment to inspect the generated files
      fs.rmSync(`${testCase.outDir}`, { recursive: true });
    });
  }
});
