import * as context from "../../context";
import * as assert from "assert";
import path from "path";
import * as apiGenerator from "../../generator/api-ts-generator";
import * as schemaParser from "./schema-parser";
import * as fs from "fs";

import { SchemaTypeObject } from "./types";

type RelaxedTypeCheck = {
  schemaRef: string;
  requiresRelaxedTypeJsDocTag: boolean;
};

const tests: {
  name: string;
  openApiFile: string;
  goldenFile: string;
  expected?: Map<string, boolean>; // using a map instead of RelaxedTypeCheck[] so that ordering can be ignored
}[] = [
  {
    name: "Petstore",
    openApiFile: "petstore.yaml",
    goldenFile: "petstore.json",
  },
  {
    name: "DemoBlogApi",
    openApiFile: "demo-blog-api.json",
    goldenFile: "demo-blog-api.json",
  },
  {
    name: "Gitlab",
    openApiFile: "gitlab.json",
    goldenFile: "gitlab.json",
  },
  {
    name: "Instagram",
    openApiFile: "instagram.json",
    goldenFile: "instagram.json",
  },
  {
    name: "Geomag",
    openApiFile: "geomag.json",
    goldenFile: "geomag.json",
  },
  {
    name: "GoogleHome",
    openApiFile: "google-home.json",
    goldenFile: "google-home.json",
  },
  {
    name: "GoogleAdsense",
    openApiFile: "google-adsense.json",
    goldenFile: "google-adsense.json",
  },
  {
    name: "CircleCI",
    openApiFile: "circleci.json",
    goldenFile: "circleci.json",
  },
  {
    name: "aws-autoscaling",
    openApiFile: "aws-autoscaling.json",
    goldenFile: "aws-autoscaling.json",
  },
  {
    name: "adobe",
    openApiFile: "adobe.json",
    goldenFile: "adobe.json",
  },
  {
    name: "Kubernetes",
    openApiFile: "kubernetes.json",
    goldenFile: "kubernetes.json",
  },
  {
    name: "1Password",
    openApiFile: "1password.json",
    goldenFile: "1password.json",
  },
  {
    name: "AwsCloudMap",
    openApiFile: "aws-cloud-map.json",
    goldenFile: "aws-cloud-map.json",
  },
  {
    name: "AmazonWorkspaces",
    openApiFile: "amazon-workspaces.json",
    goldenFile: "amazon-workspaces.json",
  },
  {
    name: "ApiDeckCrm",
    openApiFile: "apideck-crm.json",
    goldenFile: "apideck-crm.json",
  },
  {
    name: "AckoInsurance",
    openApiFile: "acko-insurance.json",
    goldenFile: "acko-insurance.json",
  },
  {
    name: "MicrosoftWorkloadMonitor",
    openApiFile: "microsoft-workload-monitor.json",
    goldenFile: "microsoft-workload-monitor.json",
  },
  {
    name: "EbayFinances",
    openApiFile: "ebay-finances.json",
    goldenFile: "ebay-finances.json",
  },
  {
    name: "AtlassianJira",
    openApiFile: "atlassian-jira.json",
    goldenFile: "atlassian-jira.json",
  },
  {
    name: "AucklandMuseum",
    openApiFile: "auckland-museum.json",
    goldenFile: "auckland-museum.json",
  },
  {
    name: "AzureAlertsManagement",
    openApiFile: "azure-alerts-management.json",
    goldenFile: "azure-alerts-management.json",
  },
  {
    name: "AzureOpenIdConnect",
    openApiFile: "azure-open-id-connect.json",
    goldenFile: "azure-open-id-connect.json",
  },
  {
    name: "MicrosoftOData",
    openApiFile: "microsoft-odata.json",
    goldenFile: "microsoft-odata.json",
  },
  {
    name: "AzureAutomationManagement",
    openApiFile: "azure-automation-management.json",
    goldenFile: "azure-automation-management.json",
  },
  {
    name: "GoogleAnalyticsHub",
    openApiFile: "google-analytics-hub.json",
    goldenFile: "google-analytics-hub.json",
  },
  {
    name: "GcpErrorReporting",
    openApiFile: "gcp-error-reporting.json",
    goldenFile: "gcp-error-reporting.json",
  },
  // {
  //   name: "GcpDatastore",
  //   openApiFile: "gcp-datastore.json",
  //   goldenFile: "gcp-datastore.json",
  // },
  {
    name: "Gmail",
    openApiFile: "gmail.json",
    goldenFile: "gmail.json",
  },
  {
    name: "HereMapsTracking",
    openApiFile: "here-maps-tracking.json",
    goldenFile: "here-maps-tracking.json",
  },
  {
    name: "HereMapsPositioning",
    openApiFile: "here-maps-positioning.json",
    goldenFile: "here-maps-positioning.json",
  },
  {
    name: "HubSpotEvents",
    openApiFile: "hubspot-events.json",
    goldenFile: "hubspot-events.json",
  },
  {
    name: "HubSpotWorkflowActions",
    openApiFile: "hubspot-workflow-actions.json",
    goldenFile: "hubspot-workflow-actions.json",
  },
  {
    name: "Lyft",
    openApiFile: "lyft.json",
    goldenFile: "lyft.json",
  },
  {
    name: "IntuitMailchimp",
    openApiFile: "intuit-mailchimp.json",
    goldenFile: "intuit-mailchimp.json",
  },
  {
    name: "Meshery",
    openApiFile: "meshery.json",
    goldenFile: "meshery.json",
  },
  {
    name: "CiscoMeraki",
    openApiFile: "cisco-meraki.json",
    goldenFile: "cisco-meraki.json",
  },
  {
    name: "Medium",
    openApiFile: "medium.json",
    goldenFile: "medium.json",
  },
  {
    name: "MercedezBenzCarConfigurator",
    openApiFile: "mercedez-benz-car-configurator.json",
    goldenFile: "mercedez-benz-car-configurator.json",
  },
  {
    name: "NewYorkTimesBooks",
    openApiFile: "nyt-books.json",
    goldenFile: "nyt-books.json",
  },
];

describe("schema-parser", async () => {
  for (const testCase of tests) {
    before(function () {
      testCase.openApiFile = path.resolve(
        __dirname,
        "../../../../tests/test-data/open-api-docs",
        testCase.openApiFile,
      );
      testCase.goldenFile = path.resolve(
        __dirname,
        "./test-data/golden-files/schema-parser-tests/",
        testCase.goldenFile,
      );
      testCase.expected = new Map<string, boolean>();
      try {
        const expectedArray: RelaxedTypeCheck[] = JSON.parse(
          fs.readFileSync(testCase.goldenFile).toString(),
        );
        expectedArray.forEach((element) => {
          testCase.expected!.set(
            element.schemaRef,
            element.requiresRelaxedTypeJsDocTag,
          );
        });
      } catch (e) {}
    });

    it(testCase.name, async () => {
      const generatedCode = await apiGenerator.generateApiTsCode(
        testCase.openApiFile,
      );
      const schemaStore = schemaParser.getParsedSchemaStore(
        generatedCode.typeNames,
        generatedCode.schemaComponents,
      );

      const got: Map<string, boolean> = new Map<string, boolean>();
      const gotTyped: RelaxedTypeCheck[] = [];
      schemaStore.getAllSchemas().forEach((schema) => {
        got.set(schema.$ref, schema._requiresRelaxedTypeJsDocTag ?? false);

        gotTyped.push({
          schemaRef: schema.$ref,
          requiresRelaxedTypeJsDocTag:
            schema._requiresRelaxedTypeJsDocTag ?? false,
        });
      });

      assert.deepEqual(got, testCase.expected);

      // uncomment to write to golden file
      // fs.writeFileSync(testCase.goldenFile, JSON.stringify(gotTyped));
    });
  }
});
