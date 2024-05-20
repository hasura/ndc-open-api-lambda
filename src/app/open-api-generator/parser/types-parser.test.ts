import * as assert from "assert";
import * as fs from "fs";
import * as path from "path";
import { generateRandomDir } from "../../../../tests/testutils";
import { parse } from "./types-parser";
import * as apiTsGenerator from "../../generator/api-ts-generator";
import * as context from "../../context";
const CircularJSON = require("circular-json");

context.getInstance().setLogLevel(context.LogLevel.PANIC);

type FunctionParams = {
  params: string;
  requireRelaxedTypeAnnotation: boolean;
};

type TestCase = {
  name: string;
  oasFile: string;

  goldenFile: string;

  // calculated by `setupTest()`
  _queryGoldenFile?: string;
  _pathGoldenFile?: string;

  expectedQueryParams?: Map<string, FunctionParams>;
  expectedPathParams?: Map<string, FunctionParams>;

  gotQueryParams?: Map<string, FunctionParams>;
  gotPathParams?: Map<string, FunctionParams>;
};

function readGoldenFileContent(
  goldenFile: string,
): Map<string, FunctionParams> | undefined {
  const queryParamsFileContent = fs.readFileSync(goldenFile, "utf8");
  if (queryParamsFileContent) {
    return new Map(Object.entries(JSON.parse(queryParamsFileContent)));
  } else {
    return undefined;
  }
}

function setupTest(testCase: TestCase) {
  testCase.oasFile = path.resolve(__dirname, testCase.oasFile);

  testCase._queryGoldenFile = path.resolve(
    __dirname,
    "./testdata/golden-files/query-tests/",
    testCase.goldenFile,
  );
  testCase._pathGoldenFile = path.resolve(
    __dirname,
    "./testdata/golden-files/path-tests/",
    testCase.goldenFile,
  );

  testCase.expectedQueryParams = readGoldenFileContent(
    testCase._queryGoldenFile,
  );
  testCase.expectedPathParams = readGoldenFileContent(testCase._pathGoldenFile);
}

async function generateCode(testCase: TestCase) {
  const gotQueryFunctionArgs = new Map<string, FunctionParams>();
  const gotPathFunctionArgs = new Map<string, FunctionParams>();

  const generatedApiTsCode = await apiTsGenerator.generateApiTsCode(testCase.oasFile);

  for (let routeData of generatedApiTsCode.routes) {
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

    const gotPath: FunctionParams = {
      params: parsedTypes.pathParams
        ? parsedTypes.pathParams._rendered
        : "null",
      requireRelaxedTypeAnnotation: parsedTypes.pathParams
        ? parsedTypes.pathParams._requiresRelaxedTypeAnnotation
        : false,
    };
    gotPathFunctionArgs.set(jsonKey, gotPath);
  }

  testCase.gotQueryParams = gotQueryFunctionArgs;
  testCase.gotPathParams = gotPathFunctionArgs;
}

const queryParamTests: TestCase[] = [
  {
    name: "DemoBlogApi",
    oasFile: "../tests/oas-docs/demo-blog-api.json",
    goldenFile: "demo-blog-api.json",
  },
  {
    name: "GeomagApi",
    oasFile: "../tests/oas-docs/geomag.json",
    goldenFile: "geomag.json",
  },
  {
    name: "Petstore",
    oasFile: "../tests/oas-docs/petstore.yaml",
    goldenFile: "petstore.json",
  },
  {
    name: "GoogleAdsense",
    oasFile: "../tests/oas-docs/google-adsense.json",
    goldenFile: "google-adsense.json",
  },
  {
    name: "Instagram",
    oasFile: "../tests/oas-docs/instagram.json",
    goldenFile: "instagram.json",
  },
  {
    name: "Gitlab",
    oasFile: "../tests/oas-docs/gitlab.json",
    goldenFile: "gitlab.json",
  },
  {
    name: "Dropbox",
    oasFile: "../tests/oas-docs/dropbox.json",
    goldenFile: "dropbox.json",
  },
  {
    name: "Adobe",
    oasFile: "../tests/oas-docs/adobe.json",
    goldenFile: "adobe.json",
  },
  {
    name: "AwsAutoscaling",
    oasFile: "../tests/oas-docs/aws-autoscaling.json",
    goldenFile: "aws-autoscaling.json",
  },
  {
    name: "Kubernetes",
    oasFile: "../tests/oas-docs/kubernetes.json",
    goldenFile: "kubernetes.json",
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
      // fs.writeFileSync(testCase._queryGoldenFile!, JSON.stringify(Object.fromEntries(testCase.gotQueryParams!)));
    });

    it(`${testCase.name}::Path`, function () {
      assert.deepEqual(testCase.expectedPathParams, testCase.gotPathParams);

      // Uncomment to update golden file
      // fs.writeFileSync(testCase._pathGoldenFile!, JSON.stringify(Object.fromEntries(testCase.gotPathParams!)));
    });
  });
}
