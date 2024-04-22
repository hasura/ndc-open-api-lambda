import * as assert from "assert";
import * as fs from "fs";
import * as path from "path";
import { generateRandomDir } from "../../../../tests/testutils";
import { generateApi } from "swagger-typescript-api";
import { getTemplatesDirectory } from "../index";
import { parse } from "./types-parser";

const tests: {
  name: string;
  oasFile: string;
  goldenFile: string;
  expected?: Map<string, string>;
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
  // {
  //   name: "GenerateParams_Petstore",
  //   oasFile: "../tests/oas-docs/petstore.yaml",
  //   goldenFile: "./testdata/golden-files/petstore.json",
  // },
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
      const gotFunctionArgs = new Map<string, string>();
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

            gotFunctionArgs.set(
              jsonKey,
              parsedTypes.queryParams && parsedTypes.queryParams?.rendered
                ? parsedTypes.queryParams?.rendered
                : "null",
            );
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
