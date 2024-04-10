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
    baseUrl: "http://localhost:9191",
    outDir: "",
    expected: "",
    headers: "",
  },
  {
    name: 'GenerateCode_Petstore',
    oasFile: './oas-docs/petstore.yaml',
    goldenFile: './golden-files/petstore',
    baseUrl: "http://localhost:13191",
  },
  {
    name: "GenerateCode_DemoBlogApi_headers",
    oasFile: "./oas-docs/demo-blog-api.json",
    goldenFile: "./golden-files/demo-blog-api-headers",
    headers: "auth=some-token=1&type=json",
    baseUrl: "http://mybaseurl/abc/def",
  },
  {
    name: 'GenerateCode_Petstore_headers',
    oasFile: './oas-docs/petstore.yaml',
    goldenFile: './golden-files/petstore-headers',
    headers: "auth=some-token=1&type=json,xml,text",
  },
  {
    name: 'GenerateCode_Instagram',
    oasFile: './oas-docs/instagram.json',
    goldenFile: './golden-files/instagram',
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
      const got = await generateCode(testCase.oasFile, `${testCase.outDir}`, true, testCase.headers, testCase.baseUrl);
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
