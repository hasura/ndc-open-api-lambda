import * as assert from "assert";
import * as fs from "fs";
import * as path from "path";
import { generateRandomDir } from "../../../../tests/testutils";
import { generateApi } from "swagger-typescript-api";
import { getTemplatesDirectory } from "../index";
import { parse } from "./types-parser";
const CircularJSON = require("circular-json");

type FunctionParams = {
  params: string;
  requireRelaxedTypeAnnotation: boolean;
};

type TestCase = {
  name: string;
  oasFile: string;
  queryParamsGoldenFile: string;
  expectedQueryParams?: Map<string, FunctionParams>;
  outDir?: string;
  gotQueryParams?: Map<string, FunctionParams>;
};

function setupTest(testCase: TestCase) {
  const outDir = generateRandomDir(
    path.resolve(__dirname, `./_temp/${testCase.name}`),
  );
  testCase.outDir = outDir;
  testCase.oasFile = path.resolve(__dirname, testCase.oasFile);
  testCase.queryParamsGoldenFile = path.resolve(
    __dirname,
    testCase.queryParamsGoldenFile,
  );
  const queryParamsFileContent = fs.readFileSync(
    testCase.queryParamsGoldenFile,
    "utf8",
  );
  if (queryParamsFileContent) {
    try {
      testCase.expectedQueryParams = new Map(
        Object.entries(JSON.parse(queryParamsFileContent)),
      );
    } catch (e) {}
  }
}

async function generateCode(testCase: TestCase) {
  const templateDir = path.resolve(getTemplatesDirectory(), "./custom");

  const gotQueryFunctionArgs = new Map<string, FunctionParams>();
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

        const gotQuery: FunctionParams = {
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

        gotQueryFunctionArgs.set(jsonKey, gotQuery);
      },
    },
  });

  testCase.gotQueryParams = gotQueryFunctionArgs;
}

function cleanup(testCase: TestCase) {
  // remove generated api.ts files
  // comment to inspect the generated files
  fs.rmSync(`${testCase.outDir}`, { recursive: true });
}

const queryParamTests: TestCase[] = [
  {
    name: "DemoBlogApi",
    oasFile: "../tests/oas-docs/demo-blog-api.json",
    queryParamsGoldenFile:
      "./testdata/golden-files/query-tests/demo-blog-api.json",
  },
  {
    name: "GeomagApi",
    oasFile: "../tests/oas-docs/geomag.json",
    queryParamsGoldenFile: "./testdata/golden-files/query-tests/geomag.json",
  },
  {
    name: "Petstore",
    oasFile: "../tests/oas-docs/petstore.yaml",
    queryParamsGoldenFile: "./testdata/golden-files/query-tests/petstore.json",
  },
  {
    name: "GoogleAdsense",
    oasFile: "../tests/oas-docs/google-adsense.json",
    queryParamsGoldenFile:
      "./testdata/golden-files/query-tests/google-adsense.json",
  },
  {
    name: "Instagram",
    oasFile: "../tests/oas-docs/instagram.json",
    queryParamsGoldenFile: "./testdata/golden-files/query-tests/instagram.json",
  },
  {
    name: "Gitlab",
    oasFile: "../tests/oas-docs/gitlab.json",
    queryParamsGoldenFile: "./testdata/golden-files/query-tests/gitlab.json",
  },
  {
    name: "Dropbox",
    oasFile: "../tests/oas-docs/dropbox.json",
    queryParamsGoldenFile: "./testdata/golden-files/query-tests/dropbox.json",
  },
  {
    name: "Adobe",
    oasFile: "../tests/oas-docs/adobe.json",
    queryParamsGoldenFile: "./testdata/golden-files/query-tests/adobe.json",
  },
  {
    name: "AwsAutoscaling",
    oasFile: "../tests/oas-docs/aws-autoscaling.json",
    queryParamsGoldenFile:
      "./testdata/golden-files/query-tests/aws-autoscaling.json",
  },
];

for (const testCase of queryParamTests) {
  describe(`Generate Params for ${testCase.name}`, async () => {
    before(async () => {
      setupTest(testCase);
      await generateCode(testCase);
    });

    it(`${testCase.name}::Query`, function () {
      assert.deepEqual(testCase.expectedQueryParams, testCase.gotQueryParams);

      // Uncomment to update golden file
      // fs.writeFileSync(testCase.queryParamsGoldenFile, JSON.stringify(Object.fromEntries(testCase.gotQueryParams!)));
    });

    after(function () {
      cleanup(testCase);
    });
  });
}
