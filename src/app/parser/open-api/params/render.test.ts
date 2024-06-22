import path from "path";
import * as apiTsGenerator from "../../../generator/api-ts-generator";
import * as routeTypes from "../route-types";
import * as types from "./types";
import * as render from "./render";
import * as fs from "fs";
import * as assert from "assert";

const cj = require("circular-json");

const OPEN_API_FILES_DIR = "../../../../../tests/test-data/open-api-docs";
const GOLDEN_FILES_DIR = "./test-data/golden-files/";

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
    name: "Adobe",
    openApiFile: "adobe.json",
    goldenFile: "adobe.json",
  },
];

describe("param-render", async () => {
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

    it(`param-parser::${testCase.name}`, async () => {
      const generatedApiTsCode = await apiTsGenerator.generateApiTsCode(
        testCase.openApiFile,
      );

      const got: Record<string, RouteParamsRendered> = {};

      for (const route of generatedApiTsCode.routes) {
        const basicChars = routeTypes.getBasicCharacteristics(route);
        const routeKey = `${basicChars.method}__${basicChars.route}:`;

        const queryParams = routeTypes.getQueryParams(route);
        const renderedQueryParams: Record<string, RenderedParam> = {};
        if (queryParams) {
          render.renderParams(queryParams);
          traverseSchema("", renderedQueryParams, queryParams);
        }

        got[routeKey] = {
          query: renderedQueryParams,
          body: {},
          path: {},
          response: {},
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
    rendered: schema._$rendered!,
    requiresRelaxedTypeAnnotation: false, // TODO: change when supported
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
