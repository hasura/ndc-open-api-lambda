import * as assert from "assert";
import * as fs from "fs";
import * as path from "path";
import { generateRandomDir } from "../../../../tests/testutils";
import { generateApi } from "swagger-typescript-api";
import { getTemplatesDirectory } from "../index";
import { parse } from "./types-parser";

type FunctionParams = {
  queryParams: string;
  pathParams: string;
  bodyParams: string;
};

const tests: {
  name: string;
  oasFile: string;
  goldenFile: string;
  expected?: Map<string, FunctionParams>;
  outDir?: string;
}[] = [
  {
    name: "GenerateParams_DemoBlogApi",
    oasFile: "../tests/oas-docs/demo-blog-api.json",
    goldenFile: "./testdata/golden-files/demo-blog-api.json",
  },
  {
    name: "GenerateParams_GeomagApi",
    oasFile: "../tests/oas-docs/geomag.json",
    goldenFile: "./testdata/golden-files/geomag.json",
  },
  {
    name: "GenerateParams_Petstore",
    oasFile: "../tests/oas-docs/petstore.yaml",
    goldenFile: "./testdata/golden-files/petstore.json",
  },
  {
    name: "GenerateParams_GoogleAdsense",
    oasFile: "../tests/oas-docs/google-adsense.json",
    goldenFile: "./testdata/golden-files/google-adsense.json",
  },
];

describe("GenerateParams", async () => {
  const templateDir = path.resolve(getTemplatesDirectory(), "./custom");
  for (const testCase of tests) {
    before(function () {
      const outDir = generateRandomDir(
        path.resolve(__dirname, `./_temp/${testCase.name}`),
      );
      testCase.outDir = outDir;
      testCase.oasFile = path.resolve(__dirname, testCase.oasFile);
      testCase.goldenFile = path.resolve(__dirname, testCase.goldenFile);
      const fileContent = fs.readFileSync(testCase.goldenFile, "utf8");
      if (fileContent) {
        try {
          testCase.expected = new Map(Object.entries(JSON.parse(fileContent)));
        } catch (e) {}
      }
    });

    it(testCase.name, async () => {
      const gotFunctionArgs = new Map<string, FunctionParams>();
      await generateApi({
        name: "api.ts",
        input: testCase.oasFile,
        output: testCase.outDir,
        templates: templateDir,
        silent: true,
        hooks: {
          onCreateRoute: (routeData) => {
            const parsedTypes = parse(routeData);
            const jsonKey = `${parsedTypes.apiMethod}_${parsedTypes.apiRoute}`;

            const got: FunctionParams = {
              queryParams:
                parsedTypes.queryParams && parsedTypes.queryParams?.rendered
                  ? parsedTypes.queryParams?.rendered
                  : "null",
              pathParams: "null",
              bodyParams: "null",
            };

            gotFunctionArgs.set(jsonKey, got);
          },
        },
      });

      assert.deepEqual(testCase.expected, gotFunctionArgs);

      // fs.writeFileSync(testCase.goldenFile, JSON.stringify(Object.fromEntries(gotFunctionArgs)));
    });

    after(function () {
      // remove generated api.ts files
      // comment to inspect the generated files
      fs.rmSync(`${testCase.outDir}`, { recursive: true });
    });
  }
});
