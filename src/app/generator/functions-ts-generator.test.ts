import * as assert from "assert";
import * as context from "../context";
import path from "path";
import { readFileSync, writeFileSync } from "fs";
import * as generator from ".";
import { cleanupAndFormat } from "../writer/functions-ts-writer";

const CircularJSON = require("circular-json");

context.getInstance().setLogLevel(context.LogLevel.PANIC);

const tests: {
  name: string;
  openApiUri: string; // for now, we only consider files on disks in test cases
  goldenFile: string;
  baseUrl?: string;
  _goldenFileContent?: string;
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
  {
    name: "AtlassianJira",
    openApiUri: "./open-api-docs/atlassian-jira.json",
    goldenFile: "./golden-files/atlassian-jira",
    baseUrl: "",
  },
  {
    name: "1Password",
    openApiUri: "./open-api-docs/1password.json",
    goldenFile: "./golden-files/1password",
    baseUrl: "",
  },
  {
    name: "AwsCloudMap",
    openApiUri: "./open-api-docs/aws-cloud-map.json",
    goldenFile: "./golden-files/aws-cloud-map",
    baseUrl: "",
  },
  {
    name: "AmazonWorkspaces",
    openApiUri: "./open-api-docs/amazon-workspaces.json",
    goldenFile: "./golden-files/amazon-workspaces",
    baseUrl: "",
  },
  {
    name: "AckoInsurance",
    openApiUri: "./open-api-docs/acko-insurance.json",
    goldenFile: "./golden-files/acko-insurance",
    baseUrl: "",
  },
  {
    name: "MicrosoftWorkloadMonitor",
    openApiUri: "./open-api-docs/microsoft-workload-monitor.json",
    goldenFile: "./golden-files/microsoft-workload-monitor",
    baseUrl: "",
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

        context
          .getInstance()
          .setOutputDirectory(
            path.resolve(
              __dirname,
              relativeDirectorToTestFiles,
              "golden-files",
            ),
          );

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
      });

      it(`should generate functions.ts file content for ${testCase.name}`, async () => {
        const got = await generator.generateCode({
          openApiUri: testCase.openApiUri,
          baseUrl: testCase.baseUrl,
        });

        const gotFunctionTs = got.filter(
          (item) => item.fileType === "functions-ts",
        )[0]!;

        const gotApiTs = got.filter((item) => item.fileType === "api-ts")[0]!;

        await cleanupAndFormat(gotFunctionTs, gotApiTs);

        assert.equal(gotFunctionTs.fileContent, testCase._goldenFileContent);

        // uncomment to update golden file
        // writeFileSync(testCase.goldenFile, gotFunctionTs.fileContent);
      });
    }
  });
}
