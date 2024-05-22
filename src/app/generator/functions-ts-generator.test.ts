import * as assert from "assert";
import * as context from "../context";
import * as legacyApiTsGenerator from "../parser/open-api/api-generator";
import * as apiTsGenerator from "./api-ts-generator";
import * as functionTsGenerator from "./functions-ts-generator";
import * as headerParser from "../parser/open-api/header-parser";
import * as prettier from "prettier";
import path from "path";
import { readFileSync, writeFileSync } from "fs";

context.getInstance().setLogLevel(context.LogLevel.PANIC);

const tests: {
  name: string;
  openApiUri: string; // for now, we only consider files on disks in test cases
  goldenFile: string;
  baseUrl?: string;
  headers?: string;
  _legacyApiComponents?: legacyApiTsGenerator.ApiComponents;
  _goldenFileContent?: string;
  _headersMap?: Map<string, string>;
}[] = [
  {
    name: "DemoBlogApi",
    openApiUri: "./oas-docs/demo-blog-api.json",
    goldenFile: "./golden-files/demo-blog-api",
    baseUrl: "http://localhost:9191",
  },
  {
    name: "Petstore",
    openApiUri: "./oas-docs/petstore.yaml",
    goldenFile: "./golden-files/petstore",
    baseUrl: "http://localhost:13191",
  },
  {
    name: "DemoBlogApi_headers",
    openApiUri: "./oas-docs/demo-blog-api.json",
    goldenFile: "./golden-files/demo-blog-api-headers",
    headers: "auth=some-token=1&type=json",
    baseUrl: "http://mybaseurl/abc/def",
  },
  {
    name: "Petstore_headers",
    openApiUri: "./oas-docs/petstore.yaml",
    goldenFile: "./golden-files/petstore-headers",
    headers: "auth=some-token=1&type=json,xml,text",
  },
  {
    name: "GitlabApi",
    openApiUri: "./oas-docs/gitlab.json",
    goldenFile: "./golden-files/gitlab",
  },
  {
    name: "Instagram",
    openApiUri: "./oas-docs/instagram.json",
    goldenFile: "./golden-files/instagram",
  },
  {
    name: "Geomag",
    openApiUri: "./oas-docs/geomag.json",
    goldenFile: "./golden-files/geomag",
  },
  {
    name: "GoogleHome",
    openApiUri: "./oas-docs/google-home.json",
    goldenFile: "./golden-files/google-home",
    baseUrl: "http://localhost:13191",
  },
  {
    name: "GoogleAdsense",
    openApiUri: "./oas-docs/google-adsense.json",
    goldenFile: "./golden-files/google-adsense",
    baseUrl: "http://localhost:13191",
  },
  {
    name: "CircleCI",
    openApiUri: "./oas-docs/circleci.json",
    goldenFile: "./golden-files/circleci",
    baseUrl: "http://localhost:13191",
  },
  {
    name: "aws-autoscaling",
    openApiUri: "./oas-docs/aws-autoscaling.json",
    goldenFile: "./golden-files/aws-autoscaling",
    baseUrl: "http://localhost:13191",
  },
  {
    name: "adobe",
    openApiUri: "./oas-docs/adobe.json",
    goldenFile: "./golden-files/adobe",
    baseUrl: "http://localhost:13191",
  },
  {
    name: "Kubernetes",
    openApiUri: "./oas-docs/kubernetes.json",
    goldenFile: "./golden-files/kubernetes",
    baseUrl: "http://localhost:9191",
  },
];

describe("functions-ts-generator", async () => {
  testGenerateFunctionsTsCode();
});

async function testGenerateFunctionsTsCode() {
  describe("generateFunctionsTsCode", async () => {
    for (const testCase of tests) {
      before(async () => {
        const relativeDirectorToTestFiles = "../open-api-generator/tests/";

        testCase.openApiUri = path.resolve(
          __dirname,
          relativeDirectorToTestFiles,
          testCase.openApiUri,
        );
        testCase.goldenFile = path.resolve(
          __dirname,
          relativeDirectorToTestFiles,
          testCase.goldenFile,
        );
        testCase._goldenFileContent = readFileSync(
          testCase.goldenFile,
        ).toString();

        if (testCase.headers) {
          testCase._headersMap = headerParser.parseHeaders(testCase.headers);
        }

        testCase._legacyApiComponents = (
          await apiTsGenerator.generateApiTsCode(testCase.openApiUri)
        ).legacyTypedApiComponents;
      });

      it(`should generate functions.ts file content for ${testCase.name}`, async () => {
        let got = await functionTsGenerator.generateFunctionsTsCode(
          testCase._legacyApiComponents!,
          testCase._headersMap,
          testCase.baseUrl,
        );

        got.fileContent = await prettier.format(got.fileContent, {
          parser: "typescript",
        });

        assert.equal(got.fileContent, testCase._goldenFileContent);

        // uncomment to update golden file
        // writeFileSync(testCase.goldenFile, got.fileContent);
      });
    }
  });
}
