import * as context from "../../context";
import * as assert from "assert";
import path from "path";
import * as apiGenerator from "../../generator/api-ts-generator";
import * as schemaParser from "./schema-parser";
import * as parserTypes from "./types";
import * as fs from "fs";
import * as generatorTypes from "../../generator/types";
import { ParsedTypes } from "./types-parser";
import * as logger from "../../../util/logger";

const cj = require("circular-json");

context.getInstance().setLogLevel(context.LogLevel.ERROR);

type RelaxedTypeCheck = {
  schemaRef: string;
  requiresRelaxedTypeJsDocTag: boolean;
  typeName: string | undefined;
};

type ParserCheck = {
  schemaRef: string;
  properties: Record<string, string>;
};

const OPEN_API_FILES_DIR = "../../../../tests/test-data/open-api-docs";
const RELAXED_TYPES_GOLDEN_FILES_DIR =
  "./test-data/golden-files/schema-parser-tests/relaxed-type-tests/";
const PARSER_TYPES_GOLDEN_FILES_DIR =
  "./test-data/golden-files/schema-parser-tests/parser-types-tests/";

const tests: {
  name: string;
  openApiFile: string;
  goldenFile: string;
  expected?: Map<string, RelaxedTypeCheck>; // using a map instead of RelaxedTypeCheck[] so that ordering can be ignored
  generatedApiTsCode?: generatorTypes.GeneratedApiTsCode;
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

  /**
   * MicrosoftOData test has been commented out because of it being huge, which is resulting in a flaky behaviour
   * The flaky behaviour exists because the elements of the array can change their position
   * and for an unkown reason deepequal on a map is not taking that into account
   */
  // {
  //   name: "MicrosoftOData",
  //   openApiFile: "microsoft-odata.json",
  //   goldenFile: "microsoft-odata.json",
  // },
  // {
  //   name: "GcpDatastore",
  //   openApiFile: "gcp-datastore.json",
  //   goldenFile: "gcp-datastore.json",
  // },
];

describe("schema-parser", async () => {
  for (const testCase of tests) {
    before(async () => {
      testCase.openApiFile = path.resolve(
        __dirname,
        OPEN_API_FILES_DIR,
        testCase.openApiFile,
      );

      testCase.generatedApiTsCode = await apiGenerator.generateApiTsCode(
        testCase.openApiFile,
      );
    });

    it(`relaxed-types::${testCase.name}`, function () {
      const schemaStore = schemaParser.getParsedSchemaStore(
        testCase.generatedApiTsCode!.typeNames,
        testCase.generatedApiTsCode!.schemaComponents,
      );
      const goldenFile = path.resolve(
        __dirname,
        RELAXED_TYPES_GOLDEN_FILES_DIR,
        testCase.goldenFile,
      );
      const expected = readRelaxedTypeGoldenFile(goldenFile);

      const got: Map<string, RelaxedTypeCheck> = new Map<
        string,
        RelaxedTypeCheck
      >();
      const gotTyped: RelaxedTypeCheck[] = [];
      schemaStore.getAllSchemas().forEach((schema) => {
        const gotRelaxedTypeCheck: RelaxedTypeCheck = {
          schemaRef: schema.$ref,
          requiresRelaxedTypeJsDocTag:
            schema._requiresRelaxedTypeJsDocTag ?? false,
          typeName: schemaStore.getTypeName(schema) ?? "__no_type_name",
        };

        got.set(schema.$ref, gotRelaxedTypeCheck);

        gotTyped.push(gotRelaxedTypeCheck);
      });

      assert.deepStrictEqual(got, expected);

      // uncomment to write to golden file
      // fs.writeFileSync(goldenFile, JSON.stringify(gotTyped));
    });

    it(`schema-types::${testCase.name}`, function () {
      const goldenFile = path.resolve(
        __dirname,
        PARSER_TYPES_GOLDEN_FILES_DIR,
        testCase.goldenFile,
      );
      const expected: ParserCheck[] = JSON.parse(
        fs.readFileSync(goldenFile).toString(),
      );

      const got: ParserCheck[] = [];
      testCase.generatedApiTsCode!.schemaComponents.forEach((schema) => {
        if (schema.$ref.startsWith("#/components/examples/")) {
          // we don't want to parse examples
          return;
        }
        got.push(parseSchema(schema));
      });

      assert.deepStrictEqual(got, expected);

      // uncomment to write to golden file
      // fs.writeFileSync(goldenFile, JSON.stringify(got));
    });
  }
});

function parseSchema(schema: parserTypes.Schema): ParserCheck {
  const ref = schema.$ref;
  const propertiesMap = {};
  try {
    parseSchemaProperties(
      parserTypes.getSchemaPropertyFromSchema(schema)!,
      0,
      propertiesMap,
    );
  } catch (e) {
    logger.error(`Error for schema: '${schema.$ref}':\n${e}`);
  }
  return {
    schemaRef: ref,
    properties: propertiesMap,
  };
}

function parseSchemaProperties(
  property: parserTypes.SchemaProperty,
  unknownSchemaPathCounter: number,
  propertiesMap: Record<string, string>,
) {
  const propertyName =
    property.$parsed?.$schemaPath?.join(".") ??
    `__undefined_${unknownSchemaPathCounter++}`;
  let propertyValue = "";
  if (parserTypes.schemaPropertyIsTypeRef(property)) {
    propertyValue = "ref";
  } else if (parserTypes.schemaPropertyIsTypeScaler(property)) {
    propertyValue = "scaler";
  } else if (parserTypes.schemaPropertyIsTypeObject(property)) {
    propertyValue = "object";
  } else if (parserTypes.schemaPropertyIsTypeArray(property)) {
    propertyValue = "array";
  } else if (parserTypes.schemaPropertyIsTypeAllOf(property)) {
    propertyValue = "allOf";
  } else if (parserTypes.schemaPropertyIsTypeContent(property)) {
    propertyValue = "content";
  } else if (parserTypes.schemaPropertyIsTypeRawArg(property)) {
    propertyValue = "rawArg";
  } else if (parserTypes.schemaPropertyIsTypePrimitive(property)) {
    propertyValue = "primitive";
  } else if (parserTypes.schemaPropertyIsTypeSchema(property)) {
    propertyValue = "schema";
  } else if (parserTypes.schemaPropertyIsSecurityScheme(property)) {
    propertyValue = "securitySchema";
  } else {
    // @ts-ignore
    propertyValue = "__unresolved";
  }

  propertiesMap[propertyName] = propertyValue;
  try {
    parserTypes.getSchemaPropertyChildren(property).forEach((child) => {
      parseSchemaProperties(child, unknownSchemaPathCounter, propertiesMap);
    });
  } catch (e) {}
}

function readRelaxedTypeGoldenFile(
  goldenFilPath: string,
): Map<string, RelaxedTypeCheck> | undefined {
  try {
    const expectedArray: RelaxedTypeCheck[] = JSON.parse(
      fs.readFileSync(goldenFilPath).toString(),
    );
    const returnMap: Map<string, RelaxedTypeCheck> = new Map<
      string,
      RelaxedTypeCheck
    >();
    expectedArray.forEach((element) => {
      returnMap.set(element.schemaRef, element);
    });
    return returnMap;
  } catch (e) {
    return undefined;
  }
}
