import * as assert from "assert";
import * as context from "../context";
import * as legacyApiTsGenerator from "../parser/open-api/api-generator";
import * as apiTsGenerator from "./api-ts-generator";
import * as functionTsGenerator from "./functions-ts-generator";
import * as headerParser from "../parser/open-api/header-parser";
import * as prettier from "prettier";
import path from "path";
import { readFileSync, writeFileSync } from "fs";
import * as types from "./types";
import * as schemaParser from "../parser/open-api/schema-parser";

const CircularJSON = require("circular-json");

context.getInstance().setLogLevel(context.LogLevel.PANIC);

const tests: {
  name: string;
  openApiUri: string; // for now, we only consider files on disks in test cases
  goldenFile: string;
  baseUrl?: string;
  headers?: string;
  _legacyApiComponents?: legacyApiTsGenerator.ApiComponents;
  _generatedApiTsComponents?: types.GeneratedApiTsCode;
  _goldenFileContent?: string;
  _headersMap?: Map<string, string>;
}[] = [
  {
    name: "DemoBlogApi",
    openApiUri: "./open-api-docs/demo-blog-api.json",
    goldenFile: "./golden-files/demo-blog-api",
    baseUrl: "http://localhost:9191",
  },
  {
    name: "Petstore",
    openApiUri: "./open-api-docs/petstore.yaml",
    goldenFile: "./golden-files/petstore",
    baseUrl: "http://localhost:13191",
  },
  {
    name: "DemoBlogApi_headers",
    openApiUri: "./open-api-docs/demo-blog-api.json",
    goldenFile: "./golden-files/demo-blog-api-headers",
    headers: "auth=some-token=1&type=json",
    baseUrl: "http://mybaseurl/abc/def",
  },
  {
    name: "Petstore_headers",
    openApiUri: "./open-api-docs/petstore.yaml",
    goldenFile: "./golden-files/petstore-headers",
    headers: "auth=some-token=1&type=json,xml,text",
  },
  {
    name: "GitlabApi",
    openApiUri: "./open-api-docs/gitlab.json",
    goldenFile: "./golden-files/gitlab",
  },
  {
    name: "Instagram",
    openApiUri: "./open-api-docs/instagram.json",
    goldenFile: "./golden-files/instagram",
  },
  {
    name: "Geomag",
    openApiUri: "./open-api-docs/geomag.json",
    goldenFile: "./golden-files/geomag",
  },
  {
    name: "GoogleHome",
    openApiUri: "./open-api-docs/google-home.json",
    goldenFile: "./golden-files/google-home",
    baseUrl: "http://localhost:13191",
  },
  {
    name: "GoogleAdsense",
    openApiUri: "./open-api-docs/google-adsense.json",
    goldenFile: "./golden-files/google-adsense",
    baseUrl: "http://localhost:13191",
  },
  {
    name: "CircleCI",
    openApiUri: "./open-api-docs/circleci.json",
    goldenFile: "./golden-files/circleci",
    baseUrl: "http://localhost:13191",
  },
  {
    name: "aws-autoscaling",
    openApiUri: "./open-api-docs/aws-autoscaling.json",
    goldenFile: "./golden-files/aws-autoscaling",
    baseUrl: "http://localhost:13191",
  },
  {
    name: "adobe",
    openApiUri: "./open-api-docs/adobe.json",
    goldenFile: "./golden-files/adobe",
    baseUrl: "http://localhost:13191",
  },
  {
    name: "Kubernetes",
    openApiUri: "./open-api-docs/kubernetes.json",
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
        const relativeDirectorToTestFiles = "../../../tests/test-data/";

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

        testCase._generatedApiTsComponents =
          await apiTsGenerator.generateApiTsCode(testCase.openApiUri);

        const parsedSchemastore = schemaParser.getParsedSchemaStore(
          testCase._generatedApiTsComponents.typeNames,
          testCase._generatedApiTsComponents.schemaComponents,
        );
        testCase._generatedApiTsComponents.schemaStore = parsedSchemastore;

        testCase._legacyApiComponents =
          testCase._generatedApiTsComponents.legacyTypedApiComponents;
      });

      it(`should generate functions.ts file content for ${testCase.name}`, async () => {
        let got = await functionTsGenerator.generateFunctionsTsCode(
          testCase._legacyApiComponents!,
          testCase._generatedApiTsComponents!,
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
