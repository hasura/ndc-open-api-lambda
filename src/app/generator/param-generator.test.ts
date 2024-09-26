import path from "path";
import * as apiTsGenerator from "./api-ts-generator";
import * as routeTypes from "../parser/open-api/route-types";
import * as types from "../parser/open-api/param-types";
import * as schemaStore from "../parser/open-api/schema-parser";
import * as render from "./param-generator";
import * as fs from "fs";
import * as assert from "assert";
import * as context from "../context";

const cj = require("circular-json");

const OPEN_API_FILES_DIR = "../../../tests/test-data/open-api-docs";
const GOLDEN_FILES_DIR = "./test-data/param-generator/golden-files/";

context.getInstance().setLogLevel(context.LogLevel.PANIC);

type RenderedParam = {
  rendered: string;
  requiresRelaxedTypeAnnotation: boolean;
};

type RouteParamsRendered = {
  query: Record<string, RenderedParam>;
  path: Record<string, RenderedParam>;
  body: Record<string, RenderedParam>;
  response: Record<string, RenderedParam>;
};

const tests: {
  name: string;
  openApiFile: string;
  goldenFile: string;
  expected?: Record<string, RouteParamsRendered>; // key:  `{routeType}__{routePath}`;
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
  {
    name: "GitHub",
    openApiFile: "github.json",
    goldenFile: "github.json",
  },
  {
    name: "DockerHub",
    openApiFile: "docker-hub.json",
    goldenFile: "docker-hub.json",
  },
  {
    name: "DockerDvpData",
    openApiFile: "docker-dvp-data.json",
    goldenFile: "docker-dvp-data.json",
  },
  {
    name: "Notion",
    openApiFile: "notion.json",
    goldenFile: "notion.json",
  },
  {
    name: "SlackWeb",
    openApiFile: "slack-web.json",
    goldenFile: "slack-web.json",
  },
  {
    name: "Snyk",
    openApiFile: "snyk.json",
    goldenFile: "snyk.json",
  },
  {
    name: "Stripe",
    openApiFile: "stripe.json",
    goldenFile: "stripe.json",
  },
  {
    name: "Trello",
    openApiFile: "trello.json",
    goldenFile: "trello.json",
  },
  {
    name: "Fitbit",
    openApiFile: "fitbit.json",
    goldenFile: "fitbit.json",
  },
  {
    name: "Vimeo",
    openApiFile: "vimeo.json",
    goldenFile: "vimeo.json",
  },
];

describe("param-generator", async () => {
  for (const testCase of tests) {
    before(async () => {
      testCase.openApiFile = path.resolve(
        __dirname,
        OPEN_API_FILES_DIR,
        testCase.openApiFile,
      );
      testCase.goldenFile = path.resolve(
        __dirname,
        GOLDEN_FILES_DIR,
        testCase.goldenFile,
      );

      try {
        testCase.expected = JSON.parse(
          fs.readFileSync(testCase.goldenFile).toString(),
        );
      } catch (e) {
        testCase.expected = {};
      }
    });

    it(`param-generator::${testCase.name}`, async () => {
      const generatedApiTsCode = await apiTsGenerator.generateApiTsCode(
        testCase.openApiFile,
      );

      generatedApiTsCode.schemaStore = schemaStore.getParsedSchemaStore(
        generatedApiTsCode.typeNames,
        generatedApiTsCode.schemaComponents,
      );

      const got: Record<string, RouteParamsRendered> = {};

      for (const route of generatedApiTsCode.routes) {
        const basicChars = routeTypes.getBasicCharacteristics(route);
        const routeKey = `${basicChars.method}__${basicChars.route}`;

        // console.log(`${routeKey}: ${cj.stringify(route)}`)

        const queryParams = routeTypes.getQueryParams(route);
        const renderedQueryParams: Record<string, RenderedParam> = {};
        if (queryParams) {
          render.renderParams(queryParams, generatedApiTsCode.schemaStore);
          traverseSchema("", renderedQueryParams, queryParams);
        }

        const pathParams = routeTypes.getPathParams(route);
        const renderedPathParams: Record<string, RenderedParam> = {};
        if (pathParams) {
          for (const param of pathParams) {
            render.renderParams(param, generatedApiTsCode.schemaStore);
            traverseSchema("", renderedPathParams, param);
          }
        }

        const responseSchema = routeTypes.getResponseSchema(route);
        const renderedResponseSchema: Record<string, RenderedParam> = {};
        if (responseSchema) {
          render.renderParams(responseSchema, generatedApiTsCode.schemaStore);
          traverseSchema("", renderedResponseSchema, responseSchema);
        }

        const bodyParam = routeTypes.getRequestBody(route);
        const renderedBodyParams: Record<string, RenderedParam> = {};
        if (bodyParam) {
          render.renderParams(bodyParam, generatedApiTsCode.schemaStore);
          traverseSchema("", renderedBodyParams, bodyParam);
        }

        got[routeKey] = {
          query: renderedQueryParams,
          body: renderedBodyParams,
          path: renderedPathParams,
          response: renderedResponseSchema,
        };
      }

      assert.deepStrictEqual(got, testCase.expected);

      // uncomment to update golden file
      // fs.writeFileSync(testCase.goldenFile, JSON.stringify(got));
    });
  }
});

function traverseSchema(
  path: string,
  params: Record<string, RenderedParam>,
  schema: types.Schema,
) {
  const currentPath = `${path}.${types.getParameterName(schema) ?? "__no_name"}`;
  params[currentPath] = {
    rendered: schema._$rendered ?? "__undefined",
    requiresRelaxedTypeAnnotation: schema._$requiresRelaxedTypeTag ?? false,
  };
  if (types.schemaIsTypeObject(schema)) {
    for (const property of types.getSchemaTypeObjectChildren(schema)) {
      traverseSchema(currentPath, params, property);
    }
  } else if (types.schemaIsTypeArray(schema)) {
    traverseSchema(currentPath, params, types.getSchemaTypeArrayChild(schema));
  } else if (types.schemaIsTypeCustomType(schema)) {
    traverseSchema(currentPath, params, types.getSchemaTypeCustomChild(schema));
  }
}
