/**
 * import ParsedRoute from swagger-typescript-api
 *
 * Should be looking at ParsedRoute.queryObjectSchema
 * Correctly pre-rendered types can be used from ParsedRoute.specificArgs
 * **** RESPONSIBILITES ****
 * 1. Correctly parse `ParsedRoute.routeParams`
 * 2. Correctly parse `ParsedRoute.requestBodyInfo`
 * 3. Render the arguments of a function
 * 4. Render the argument mapping in the function API function call
 *
 * This file contains functions that can take the following objects as input and parse them correctly
 * Individual object documentation is provided below with some examples
 * Please note that the examples provided should contain a set of variables with as wide as a dataset possible
 *
 * ParsedRoute.routeParams
 *   - routeParams.path: Contains the path variables
 *     example: [{"description":"The ID of a project","in":"path","name":"id","required":true,"schema":{"type":"string","$parsed":{"type":"primitive","$schemaPath":["PutV3ProjectsIdParams",null],"$parsedSchema":true,"schemaType":"primitive","typeIdentifier":"type","name":null,"description":"","content":"string"}},"type":"string"}]
 *
 *   - routeParams.formData
 *     example: [{"description":"The name of the project","in":"formData","name":"name","required":false,"type":"string"},{"description":"The default branch of the project","in":"formData","name":"default_branch","required":false,"type":"string"},{"description":"The path of the repository","in":"formData","name":"path","required":false,"type":"string"},{"description":"The description of the project","in":"formData","name":"description","required":false,"type":"string"},{"description":"Flag indication if the issue tracker is enabled","in":"formData","name":"issues_enabled","required":false,"type":"boolean"},{"description":"Flag indication if merge requests are enabled","in":"formData","name":"merge_requests_enabled","required":false,"type":"boolean"},{"description":"Flag indication if the wiki is enabled","in":"formData","name":"wiki_enabled","required":false,"type":"boolean"},{"description":"Flag indication if builds are enabled","in":"formData","name":"builds_enabled","required":false,"type":"boolean"},{"description":"Flag indication if snippets are enabled","in":"formData","name":"snippets_enabled","required":false,"type":"boolean"},{"description":"Flag indication if shared runners are enabled for that project","in":"formData","name":"shared_runners_enabled","required":false,"type":"boolean"},{"description":"Flag indication if the container registry is enabled for that project","in":"formData","name":"container_registry_enabled","required":false,"type":"boolean"},{"description":"Flag indication if Git LFS is enabled for that project","in":"formData","name":"lfs_enabled","required":false,"type":"boolean"},{"description":"Create a public project. The same as visibility_level = 20.","in":"formData","name":"public","required":false,"type":"boolean"},{"description":"Create a public project. The same as visibility_level = 20.","enum":[0,10,20],"format":"int32","in":"formData","name":"visibility_level","required":false,"type":"integer"},{"description":"Perform public builds","in":"formData","name":"public_builds","required":false,"type":"boolean"},{"description":"Allow users to request member access","in":"formData","name":"request_access_enabled","required":false,"type":"boolean"},{"description":"Only allow to merge if builds succeed","in":"formData","name":"only_allow_merge_if_build_succeeds","required":false,"type":"boolean"},{"description":"Only allow to merge if all discussions are resolved","in":"formData","name":"only_allow_merge_if_all_discussions_are_resolved","required":false,"type":"boolean"}]
 *
 * ParsedRoute.requestBodyInfo
 */

import path from "path";
import { getTemplatesDirectory } from "..";
import { Eta } from "eta";
const CircularJSON = require("circular-json");

export type Schema = {
  $ref?: string;
  description?: string;
  name?: string;
  in?: string;
  required?: boolean;
  schema?: Schema;
  $parsed?: Schema;
  enum?: number[] | string[] | any[];
  type: string;
  properties?: Record<string, Schema>;
  content?: any[];
  items?: Schema;

  /**
   * variables that begin with `_` are not a part of JSON, but calculated by this package
   */
  _rendered?: string; // contains the rendered string for this schema node
  _requiresRelaxedTypeAnnotation?: boolean;
};

export type SpecificArgsObject = {
  name?: string; // name of the variable
  optional: boolean;
  type: string; // the string representation of all args
  tsArgName?: string;
};

// represents `ParsedRoute.specificArgs`
export type SpecificArgs = {
  body?: SpecificArgsObject;
  pathParams?: SpecificArgsObject;
  query?: SpecificArgsObject;
};

// export type ParsedType = {
//   requiresRelaxedTypeAnnotation: boolean,
//   specificArgs: SpecificArgs,
//   functionArgsRendered: string,
//   functionArgsMappingRendered: string,
// }

export type ParsedTypes = {
  apiMethod: string;
  apiRoute: string;
  queryParams: Schema | undefined;
};

/**
 * 
 * @param routeParams : ParsedRoute.routeParams
 * routeParams contains:
 * path[], header[], body[], query[], formData[], cookie[],
 * 
 * `formData` represents request body data, if the content type is `application/x-www-form-urlencoded`
 * Otherwise, in case of content type being `application/json`, request body data is contained in `ParsedRoute.requestBodyInfo`
 * 
 * **** EXAMPLES ****
 * path[]: 
  [
    {
      "description": "delete author",
      "name": "authorId",
      "in": "path",
      "required": true,
      "schema": {
        "type": "string",
        "$parsed": {
          "type": "primitive",
          "$schemaPath": [
            "AuthorDeleteParams",
            null
          ],
          "$parsedSchema": true,
          "schemaType": "primitive",
          "typeIdentifier": "type",
          "name": null,
          "description": "",
          "content": "string"
        }
      },
      "type": "string"
    }
  ]

 * query[]
  [
    {
      "description": "blog to dislike",
      "name": "blogId",
      "in": "query",
      "required": true,
      "schema": {
        "type": "string"
      },
      "type": "string"
    }
  ] 

  * formData[]:
[
  {
    "description": "The default branch of the project",
    "in": "formData",
    "name": "default_branch",  // name of the variable
    "required": false,
    "type": "string" // data type
  },
  {
    "description": "Flag indication if the issue tracker is enabled",
    "in": "formData",
    "name": "issues_enabled",
    "required": false,
    "type": "boolean"
  },
  {
    "description": "Create a public project. The same as visibility_level = 20.",
    "enum": [
      0,
      10,
      20
    ],
    "format": "int32",
    "in": "formData",
    "name": "visibility_level",
    "required": false,
    "type": "integer"
  },
]
 */
export function routeParamsParser(routeParams: any) {
  /* routeParams */
}

/**
 *
 * @param routeData the route data the is passed in the `onCreateRoute()` hook of `generateApi()`
 */
export function parse(routeData: any): ParsedTypes {
  console.log(`\n\nAPI: ${routeData.raw.method} ${routeData.raw.route}`);

  // const specificArgs = parseSpecificArgs(routeData.specificArgs as SpecificArgs)

  // console.log(`\n\n\nRouteParams ${routeData.raw.method} ${routeData.raw.route}: ${CircularJSON.stringify(routeData.routeParams)}`);
  // console.log(`Specific args ${routeData.raw.method} ${routeData.raw.route}: ${CircularJSON.stringify(routeData.specificArgs)}`);

  // if (`${routeData.raw.method} ${routeData.raw.route}` === "get /v3/projects/search/{query}") {
  // console.log(`queryObjectSchema ${routeData.raw.method} ${routeData.raw.route}: ${CircularJSON.stringify(routeData.queryObjectSchema)}`,);
  //   console.log(`routeData ${routeData.raw.method} ${routeData.raw.route}: ${CircularJSON.stringify(routeData)}`,);
  // }

  const queryParams = parseQueryParams(
    routeData.queryObjectSchema,
    routeData?.specificArgs?.query as SpecificArgsObject,
  );

  return {
    apiMethod: routeData.raw.method,
    apiRoute: routeData.raw.route,
    queryParams: queryParams,
  };

  // const templateDir = path.resolve(getTemplatesDirectory(), "./functions-modular")
  // const templateFile = "function-args.ejs";
  // const eta = new Eta({ views: templateDir});
  // const specificArgObjectArr = [specificArgs.body, specificArgs.pathParams];
  // console.log("specific args object arr", specificArgObjectArr)
  // let functionArgsRendered = eta.render(templateFile, { specificArgsObjectArr: specificArgObjectArr });

  // console.log('functionsArgsRendered: ', functionArgsRendered);

  // return {
  //   specificArgs: specificArgs,
  //   requiresRelaxedTypeAnnotation: false,
  //   functionArgsRendered: functionArgsRendered,
  //   functionArgsMappingRendered: '',
  // };
}

type StateParams = {
  requireRelaxedTypeAnnotation: boolean;
};

export function parseQueryParams(
  queryParams: any,
  querySpecificArgs: SpecificArgsObject | undefined,
): Schema | undefined {
  if (!queryParams || !queryParams.$parsed) {
    console.log("no query params");
    return undefined; // no query params
  }
  // console.log('queryParams.$parsed: ', queryParams.$parsed);

  const stateParams: StateParams = {
    requireRelaxedTypeAnnotation: false,
  };

  const queryParamName = querySpecificArgs?.name
    ? querySpecificArgs?.name
    : "query";
  const querySchema: Schema = {
    name: queryParamName,
    type: "object",
    properties: queryParams.properties,
    required: !(querySpecificArgs?.optional
      ? querySpecificArgs.optional
      : false),
  };
  querySchema._rendered = renderQueryParams(querySchema, stateParams);
  querySchema._requiresRelaxedTypeAnnotation =
    stateParams.requireRelaxedTypeAnnotation;
  console.log(querySchema._rendered);
  // console.log('querySchemaJson: ', CircularJSON.stringify(querySchema));
  return querySchema;
}

function renderQueryParams(
  schema: Schema | undefined,
  stateParams: StateParams,
): string {
  if (!schema) {
    return "";
  }

  if (schema.$ref) {
    // TODO: add proper solution for $ref
    // this is temp hack for now

    const brokenRef = schema.$ref.split("/");
    const type = brokenRef[brokenRef.length - 1];

    schema._rendered = renderSchema(
      schema.description,
      schema.required,
      schema.name,
      `${type}`,
    );
    return schema._rendered;
  } else if (schema.type === "object") {
    // parse object
    let result = "";
    for (const property in schema.properties) {
      result = `${result}  ${renderQueryParams(schema.properties[property], stateParams)}`;
    }
    schema._rendered = renderSchema(
      schema.description,
      schema.required,
      `${schema.name}`,
      `{ ${result} }`,
    );
    return schema._rendered;
  } else if (schema.type === "array") {
    let nestedType = renderQueryParams(schema.items, stateParams); // this type has a trailing comma
    let type: string;
    if (schema.items?.enum) {
      // handle special case, that the item is an array of enums
      // in this case, we will enclose the returned type in ()
      type = `(${nestedType.substring(0, nestedType.length - 1)})[]`; // remove the trailing comma, enclose is (), add `[]` to denote an array
    } else {
      type = `${nestedType.substring(0, nestedType.length - 1)}[]`; // remove the trailing comma, add `[]` to denote an array
    }

    schema._rendered = renderSchema(
      schema.description,
      schema.required,
      schema.name,
      type,
    );
    return schema._rendered;
  } else if (schema.enum) {
    let type = "";
    if (schema.$parsed && schema.$parsed.content) {
      const values = schema.$parsed.content.map((x) => x.value);
      type = values.join(" | ");
    }
    stateParams.requireRelaxedTypeAnnotation = true;
    schema._rendered = renderSchema(
      schema.description,
      schema.required,
      schema.name,
      `${type}`,
    );
    return schema._rendered;
  } else {
    let type = schema.type;
    if (
      type === "integer" ||
      type === "int" ||
      type === "float" ||
      type === "double"
    ) {
      type = "number";
    }
    if (type === "any" || type === "Record" || type === "Map") {
      stateParams.requireRelaxedTypeAnnotation = true;
    }
    schema._rendered = renderSchema(
      schema.description,
      schema.required,
      schema.name,
      `${type}`,
    );
    return schema._rendered;
  }
}

function renderSchema(
  description: string | undefined,
  required: boolean | undefined,
  name: string | undefined,
  type: string,
) {
  const schemaDescription = description ? `/** ${description} */` : "";

  if (name) {
    // name = performVariableNameCorrection(name);
    if (required && required === true) {
      name = `${name}:`;
    } else {
      name = `${name}?:`;
    }
  } else {
    name = "";
  }

  return `${schemaDescription} ${name} ${type},`;
}

function performVariableNameCorrection(name: string): string {
  // check if the string has special chars
  // if it does, enclose it in double quotes
  const format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
  if (format.test(name)) {
    return `"${name}"`;
  } else {
    return name;
  }
}

export function parseSpecificArgs(specificArgs: SpecificArgs): SpecificArgs {
  if (specificArgs.body) {
    specificArgs.body.tsArgName = specificArgs.body.name;
  }
  if (specificArgs.pathParams) {
    // specificArgs.pathParams.tsArgName = 'def'
    // parse path arguments
  }
  return specificArgs;
}

function renderFunctionArgs(specificArgs: SpecificArgs) {}
