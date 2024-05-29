import * as context from "../../context";
import * as headerParser from "./header-parser";
import * as assert from "assert";
import path from "path";
import * as apiGenerator from "../../generator/api-ts-generator";
import * as routeTypes from "./route-types";
import * as fs from "fs";

context.getInstance().setLogLevel(context.LogLevel.ERROR);

type Test = {
  name: string;
  openApiFile: string;
  goldenFile: string;
  expected?: Map<string, string[] | undefined>;
  routes?: routeTypes.ApiRoute[];
};

const tests: Test[] = [
  {
    name: "Petstore",
    openApiFile: "petstore.yaml",
    goldenFile: "petstore.json",
  },
  {
    name: "aws-autoscaling",
    openApiFile: "aws-autoscaling.json",
    goldenFile: "aws-autoscaling.json",
  },
];

function getRouteId(routeChars: routeTypes.BasicRouteCharacterstics) {
  return `${routeChars.method}__${routeChars.route}`;
}

describe("header-parser", function () {
  for (const testCase of tests) {
    before(async () => {
      testCase.openApiFile = path.resolve(
        __dirname,
        "../../../../tests/test-data/open-api-docs",
        testCase.openApiFile,
      );

      const generatedCode = await apiGenerator.generateApiTsCode(
        testCase.openApiFile,
      );
      testCase.routes = generatedCode.routes;

      testCase.goldenFile = path.resolve(
        __dirname,
        "./test-data/golden-files/header-parser-tests",
        testCase.goldenFile,
      );

      try {
        testCase.expected = new Map(
          Object.entries(
            JSON.parse(fs.readFileSync(testCase.goldenFile).toString()),
          ),
        );
      } catch (e) {
        testCase.expected = new Map<string, string[] | undefined>();
      }
    });

    it(`header-parser::${testCase.name}`, function () {
      const got: Map<string, string[] | undefined> = new Map<
        string,
        string[] | undefined
      >();
      for (const route of testCase.routes!) {
        const headers = headerParser.parseRouteHeaders(route);
        const routeId = getRouteId(routeTypes.getBasicCharacteristics(route));

        got.set(routeId, headers ? Array.from(headers) : []);
      }

      assert.deepEqual(got, testCase.expected);

      // uncomment to update golden file
      // fs.writeFileSync(testCase.goldenFile, JSON.stringify(Object.fromEntries(got)));
    });
  }
});
