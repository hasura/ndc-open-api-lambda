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
