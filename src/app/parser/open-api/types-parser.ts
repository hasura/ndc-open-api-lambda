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
import { Eta } from "eta";
const CircularJSON = require("circular-json");

export type Schema = {
  $ref?: string;
  description?: string;
  name?: string;
  in?: string;
  required?: boolean | string[];
  schema?: Schema;
  $parsed?: Schema;
  enum?: number[] | string[] | any[];
  type: string;
  properties?: Record<string, Schema>;
  content?: any[];
  items?: Schema;
  allOf?: Schema[];

  /**
   * variables that begin with `_` are not a part of JSON, but calculated by this package
   */
  _rendered?: string; // contains the rendered string for this schema node
  _requiresRelaxedTypeAnnotation?: boolean;
  _required?: boolean;
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

export type ParsedTypes = {
  apiMethod: string;
  apiRoute: string;
  queryParams: Schema | undefined;
  pathParams: ParsedPathParams | undefined;
};

export type ParsedPathParams = {
  params: Schema[];
  _rendered: string;
  _requiresRelaxedTypeAnnotation: boolean;
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

/**
 * @param routeData the route data the is passed in the `onCreateRoute()` hook of `generateApi()`
 */
export function parse(routeData: any): ParsedTypes {
  // console.log(`\n\n\nAPI: ${routeData.raw.method}_${routeData.raw.route}`);

  const queryParams = parseQueryParams(
    routeData.queryObjectSchema,
    routeData?.specificArgs?.query as SpecificArgsObject,
  );

  const pathParams = parsePathParams(
    routeData.pathObjectSchema as Schema,
    routeData?.specificArgs?.pathParams as SpecificArgsObject,
  );

  return {
    apiMethod: routeData.raw.method,
    apiRoute: routeData.raw.route,
    queryParams: queryParams,
    pathParams: pathParams,
  };
}

type StateParams = {
  requireRelaxedTypeAnnotation: boolean;
};

function parsePathParams(
  pathParams: Schema | undefined,
  pathSpecificArgs: SpecificArgsObject | undefined,
): ParsedPathParams | undefined {
  if (!pathParams) {
    return undefined;
  }

  if (!pathParams?.properties) {
    return undefined;
  }

  let requiresRelaxedTypeAnnoation = false;

  let rendered = "";

  const parsedPathParamsArray: Schema[] = [];
  for (const property in pathParams?.properties) {
    const stateParams: StateParams = {
      requireRelaxedTypeAnnotation: false,
    };

    const propertyObj = pathParams.properties[property]!;
    propertyObj._rendered = renderQueryParams(
      property,
      propertyObj,
      stateParams,
    );
    parsedPathParamsArray.push(propertyObj);

    if (propertyObj._rendered) {
      rendered = rendered.concat(propertyObj._rendered);
    }

    propertyObj._requiresRelaxedTypeAnnotation =
      stateParams.requireRelaxedTypeAnnotation;

    if (!requiresRelaxedTypeAnnoation) {
      requiresRelaxedTypeAnnoation = stateParams.requireRelaxedTypeAnnotation;
    }
  }

  if (parsedPathParamsArray.length === 0) {
    return undefined;
  }

  parsedPathParamsArray.sort((a, b) =>
    a.required && !b.required ? -1 : b.required && !a.required ? 1 : 0,
  );
  return {
    params: parsedPathParamsArray,
    _rendered: rendered,
    _requiresRelaxedTypeAnnotation: requiresRelaxedTypeAnnoation,
  };
}

export function parseQueryParams(
  queryParams: any,
  querySpecificArgs: SpecificArgsObject | undefined,
): Schema | undefined {
  if (!queryParams || !queryParams.$parsed) {
    return undefined; // no query params
  }

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

    // `required` requires a temp fix of being set to true because of how variables are rendered by function.ejs
    required: true, // ACTUAL VALUE -> required: !(querySpecificArgs?.optional ? querySpecificArgs.optional : false),
  };
  querySchema._rendered = renderQueryParams(
    queryParamName,
    querySchema,
    stateParams,
  );
  querySchema._requiresRelaxedTypeAnnotation =
    stateParams.requireRelaxedTypeAnnotation;
  return querySchema;
}

function renderQueryParams(
  name: string, // the json key of this json value; also the name of the vairable
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
      schema._required === true ? schema._required : schema.required,
      schema.name,
      `${type}`,
    );
    return schema._rendered;
  } else if (schema.allOf) {
    schema._rendered = renderSchema(
      schema.$parsed?.description,
      schema._required === true
        ? schema._required
        : schema.required === true || schema.$parsed?.required === true,
      name,
      `${schema.$parsed?.content}`,
    );
    return schema._rendered;
  } else if (schema.type === "object") {
    // parse object
    let result = "";

    for (const property in schema.properties) {
      if (
        Array.isArray(schema.required) &&
        schema.required.indexOf(property) > -1
      ) {
        /**
         * if the `required` field in this schema is an array, then that array contains all the properties that are required
         * therefore, mark the `_required` field of that property as `true`
         * *DO NOT* mark the `required` field as `true`, because this property might be an object that also has its `required` set as an array
         */
        schema.properties[property]!._required = true;
      }
      result = `${result}  ${renderQueryParams(property, schema.properties[property], stateParams)}`;
    }
    schema._rendered = renderSchema(
      schema.description,
      schema._required === true ? schema._required : schema.required,
      name,
      `{ ${result} }`,
    );
    return schema._rendered;
  } else if (schema.type === "array") {
    let nestedType = renderQueryParams(name, schema.items, stateParams); // this type has a trailing comma
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
      schema._required === true ? schema._required : schema.required,
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
      schema._required === true ? schema._required : schema.required,
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
      schema._required === true ? schema._required : schema.required,
      schema.name,
      `${type}`,
    );
    return schema._rendered;
  }
}

function renderSchema(
  description: string | undefined,
  required: boolean | string[] | undefined,
  name: string | undefined,
  type: string,
) {
  let schemaDescription = "";
  if (description) {
    if (description.endsWith("\n")) {
      schemaDescription = `\n/**\n* ${description} */\n`;
    } else {
      schemaDescription = `\n/**\n* ${description}\n*/\n`;
    }
  }

  if (name) {
    name = performVariableNameCorrection(name);
    if (!Array.isArray(required) && required && required === true) {
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
  const hasSpecialCharsRegEx = /[!@#%^&*()+\-=\[\]{};':"\\|,.<>\/?]+/;
  const startsWithNumberRegEx = /^[0-9]/;
  if (hasSpecialCharsRegEx.test(name) || startsWithNumberRegEx.test(name)) {
    return `"${name}"`;
  } else {
    return name;
  }
}
