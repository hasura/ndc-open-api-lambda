import * as assert from "assert";
import * as fs from "fs";
import * as path from "path";
import { generateRandomDir } from "../../../../tests/testutils";
import { generateApi } from "swagger-typescript-api";
import { getTemplatesDirectory } from "../index";
import { parse } from "./types-parser";

type FunctionParams = {
  params: string;
  requireRelaxedTypeAnnotation: boolean;
};

type TestCase = {
  name: string;
  oasFile: string;
  goldenFile: string;
  expected?: Map<string, FunctionParams>;
  outDir?: string;
};

function setupTest(testCase: TestCase) {
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
}

function cleanup(testCase: TestCase) {
  // remove generated api.ts files
  // comment to inspect the generated files
  fs.rmSync(`${testCase.outDir}`, { recursive: true });
}

const queryParamTests: TestCase[] = [
  {
    name: "GenerateQueryParams_DemoBlogApi",
    oasFile: "../tests/oas-docs/demo-blog-api.json",
    goldenFile: "./testdata/golden-files/query-tests/demo-blog-api.json",
  },
  {
    name: "GenerateQueryParams_GeomagApi",
    oasFile: "../tests/oas-docs/geomag.json",
    goldenFile: "./testdata/golden-files/query-tests/geomag.json",
  },
  {
    name: "GenerateQueryParams_Petstore",
    oasFile: "../tests/oas-docs/petstore.yaml",
    goldenFile: "./testdata/golden-files/query-tests/petstore.json",
  },
  {
    name: "GenerateQueryParams_GoogleAdsense",
    oasFile: "../tests/oas-docs/google-adsense.json",
    goldenFile: "./testdata/golden-files/query-tests/google-adsense.json",
  },
  {
    name: "GenerateQueryParams_Instagram",
    oasFile: "../tests/oas-docs/instagram.json",
    goldenFile: "./testdata/golden-files/query-tests/instagram.json",
  },
  {
    name: "GenerateQueryParams_Gitlab",
    oasFile: "../tests/oas-docs/gitlab.json",
    goldenFile: "./testdata/golden-files/query-tests/gitlab.json",
  },
  {
    name: "GenerateQueryParams_Dropbox",
    oasFile: "../tests/oas-docs/dropbox.json",
    goldenFile: "./testdata/golden-files/query-tests/dropbox.json",
  },
  {
    name: "GenerateQueryParams_Adobe",
    oasFile: "../tests/oas-docs/adobe.json",
    goldenFile: "./testdata/golden-files/query-tests/adobe.json",
  },
  {
    name: "GenerateQueryParams_AwsAutoscaling",
    oasFile: "../tests/oas-docs/aws-autoscaling.json",
    goldenFile: "./testdata/golden-files/query-tests/aws-autoscaling.json",
  },
];

describe("GenerateQueryParams", async () => {
  const templateDir = path.resolve(getTemplatesDirectory(), "./custom");
  for (const testCase of queryParamTests) {
    before(function () {
      setupTest(testCase);
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
              params:
                parsedTypes.queryParams && parsedTypes.queryParams?._rendered
                  ? parsedTypes.queryParams?._rendered
                  : "null",
              requireRelaxedTypeAnnotation:
                parsedTypes.queryParams &&
                parsedTypes.queryParams?._requiresRelaxedTypeAnnotation
                  ? parsedTypes.queryParams &&
                    parsedTypes.queryParams?._requiresRelaxedTypeAnnotation
                  : false,
            };

            gotFunctionArgs.set(jsonKey, got);
          },
        },
      });

      assert.deepEqual(testCase.expected, gotFunctionArgs);

      // fs.writeFileSync(testCase.goldenFile, JSON.stringify(Object.fromEntries(gotFunctionArgs)));
    });

    after(function () {
      cleanup(testCase);
    });
  }
});
