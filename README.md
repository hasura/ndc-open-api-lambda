# OpenAPI Lambda Connector

[![Docs](https://img.shields.io/badge/docs-v3.x-brightgreen.svg?style=flat)](https://hasura.io/docs/3.0/getting-started/overview/)
[![ndc-hub](https://img.shields.io/badge/ndc--hub-postgres-blue.svg?style=flat)](https://hasura.io/connectors)
[![License](https://img.shields.io/badge/license-Apache--2.0-purple.svg?style=flat)](LICENSE.txt)

The OpenAPI Lambda Connector allows you to import APIs that have an OpenAPI/Swagger Documentation into the Hasura Supergraph. It works by creating the Data Types and API calls required in Typescript and wrapping those API calls in functions. These functions can then be exposed as queries or mutations via the [NodeJS Lambda Connector](https://github.com/hasura/ndc-nodejs-lambda).

Functions that wrap GET requests are marked with `@readonly` annotation, and are exposed as GraphQL Queries by the [NodeJS Lambda Connector](https://github.com/hasura/ndc-nodejs-lambda). All other request types are exposed as GraphQL Mutations.

This Connector implements the [Data Connector Spec](https://github.com/hasura/ndc-spec)

- [Hasura V3 Documentation](https://hasura.io/docs/3.0)
- [NodeJS Lambda Connector](https://github.com/hasura/ndc-nodejs-lambda)

## Features

- Convert Open API/swagger documentation into Typescript functions compatible with NodeJS Lambda Connector
- Supported request types

| Request Type | Query | Path | Body | Headers |
| ------------ | ----- | ---- | ---- | ------- |
| GET          | ✅    | ✅   | NA   | Y       |
| POST         | ✅    | ✅   | ✅   | ✅      |
| DELETE       | ✅    | ✅   | ✅   | ✅      |
| PUT          | ✅    | ✅   | ✅   | ✅      |
| PATCH        | ✅    | ✅   | ✅   | ✅      |

## Before you get Started

1. Create a [Hasura Cloud account](https://console.hasura.io)
2. Install the [DDN CLI](https://hasura.io/docs/3.0/cli/installation/)
3. Please ensure that you have Docker installed and the Docker Daemon is running.
4. If you want to make changes to the generated Typescript files, please ensure you have Node.js v20+ installed

## Quickstart using the DDN CLI

> [!TIP]
> The following instructions are just a quick summary of how to use the OpenAPI Lambda connector.
> To see it in use in a wider Hasura DDN project, and to understand the underlying DDN concepts, please check out the [Hasura DDN Getting Started Guide](https://hasura.io/docs/3.0/getting-started/overview/).

> [!NOTE]
> This section assumes that you have already setup a Supergraph and added a Subgraph.

1. Initialize the connector

```
ddn connector init my_openapi --subgraph my_subgraph --hub-connector hasura/openapi
```

This will generate the necessary files into the `my_subgraph/connector/my_openapi` directory. Your functions and API calls will be created in this directory.

2. Add the correct environment variables to `/my_subgraph/connector/my_openapi/.env.local`. Supported environment variables and their description are listed under [Supported Environment Variables](#supported-environment-variables) section.

3. Modify the Docker container port. (More on this in the [getting started guide](https://hasura.io/docs/3.0/getting-started/connect-to-data/connect-a-source#step-2-modify-the-port))

4. Introspect the OpenAPI document using the connector

```
ddn connector introspect --connector my_subgraph/connector/my_openapi/connector.yaml
```

This will introspect your OpenAPI document and create an `api.ts` file, `functions.ts` file and other supporting files required to run the Typescript project.

- The `api.ts` file contains the Data Types and API calls from the OpenAPI document
- The `functions.ts` file contains functions that wrap API calls. You can modify this `functions.ts` file to introduce business logic if you want to. See [Saving User Changes](#saving-user-changes) if you want to preserve your changes in this file when you introspect the OpenAPI document again.

5. Add a [Data Connector Link](https://hasura.io/docs/3.0/supergraph-modeling/data-connector-links)

```
ddn connector-link add my_openapi --subgraph my_subgraph
```

This will create a file `my_subgraph/metadata/my_openapi.hml` that links your Open API connector to your Hasura Supergraph.

6. Update the evironment variables listed in `my_subgraph/metadata/my_openapi.hml` (here, `MY_SUBGRAPH_MY_OPENAPI_READ_URL` and `MY_SUBGRAPH_MY_OPENAPI_WRITE_URL`) in `my_subgraph/.env.my_subgraph`.

(More on steps 5 and 6 in the [getting started guide](https://hasura.io/docs/3.0/getting-started/connect-to-data/create-source-metadata#step-1-create-the-hasura-metadata))

7. Start the connector in a Docker container

```
docker compose -f my_subpgraph/connector/my_openapi/docker-compose.my_openapi.yaml up
```

The `http://localhost:${your-docker-container-port}/schema/` should return the schema of your OpenAPI Connector. All functions that wrap `GET` requests will be listed in the `functions` array, while all other functions will be listed in the `procedures` array.

8. Add the connector schema to [Data Connector Link](<(https://hasura.io/docs/3.0/supergraph-modeling/data-connector-links)>)

```
ddn connector-link update my_openapi --subgraph my_subgraph
```

This command will modify `my_subgraph/metadata/my_openapi.hml`, and the schema of the connector will be added to the `definition.schema` key.

9. Add all resources in your connector schema to your GraphQL API

```
ddn connector-link update my_openapi --subgraph my_subgraph --add-all-resources
```

This will create HML files that represent resources in your connector schema at `my_subgraph/metadata`. These HML files specify your GraphQL API. (More about this in the [getting started guide](https://hasura.io/docs/3.0/getting-started/connect-to-data/add-source-entities#add-a-model))

You have now added the OpenAPI Connector and imported all of your APIs in your supergraph. You can now:

- Deploy the supergraph to Hasura DDN (Please follow the steps [here](https://hasura.io/docs/3.0/getting-started/deployment/))
- Run the supergraph locally for debugging (Please follow the steps [here](https://hasura.io/docs/3.0/getting-started/build-your-api))

## Documentation

This connector is published as a Docker Image. The image name is `ghcr.io/hasura/ndc-open-api-lambda`. The Docker Image accepts the following environment variables that can be used to alter its functionality. These variables, if present in the `ConnectorManifest` of your DDN Metadata, will be passed by the DDN CLI to the Connector.

### Supported Environment Variables

1. `NDC_OAS_DOCUMENT_URI` (optional): The URI to your Open API Document. If you're using a file instead of a HTTP link, please ensure that it is named `swagger.json` and is present in the root directory of the volume being mounted to `/etc/connector`. This env var is nullable.
2. `NDC_OAS_BASE_URL` (optional): The base URL of your API. This env var is nullable.
3. `NDC_OAS_FILE_OVERWRITE` (optional): Boolean flag to allow previously generated files to be over-written. Defaults to `false`. Please note that the codegen will fail with an error if this is set to `false` and the files that the codegen would create already exist.
4. `HASURA_PLUGIN_LOG_LEVEL` (optional): The log level. Possible values: `trace`, `debug`, `info`, `warn`, `error`, `fatal`, `panic`. Defaults to `info`
5. `NDC_OAS_LAMBDA_PRETTY_LOGS` (optional): Boolean flag to print human readable logs instead of JSON. Defaults to `false`

### Saving User Changes

When re-introspecting the connector, user changes in `functions.ts` can be preserved by adding an `@save` JS Doc Tag to the documentation comment of a function. This will ensure that that function is not overwritten and the saved function will be added if missing in the newly generated `functions.ts`

Example
```
/**
 * Dummy function that mutates an API response
 * @save
 */
function dumDaDumDaDum(response: ApiResponseObject) {
  response.description = "No description for you, figure this out yourself";
}
```

### Usage without the DDN CLI

The Docker Image can be used without the DDN CLI as a codegen tool for the [NDC NodeJS Lambda Connector](https://github.com/hasura/ndc-nodejs-lambda). Please see the Examples section on how to do that.

The Docker Container will output the generated files at `/etc/connector`. Please ensure that a volume mount is present at that directory while using the `docker run` command

NOTE: The Docker Container uses the NDC Open API Lambda Connector CLI internally, so `-h` on any command will print the help for that command. Also, env vars can be substituted with CLI flags passed to the `docker run` command

### Examples

```
# get command documentation/help
docker run --rm ghcr.io/hasura/ndc-open-api-lambda:v0.1.1 update -h

# run the code generation (using env vars)
docker run --rm -v ./:/etc/connector/ -e NDC_OAS_DOCUMENT_URI=${url to open API document} ghcr.io/hasura/ndc-open-api-lambda:v0.1.1 update

# run the code generation (using CLI flags)
docker run --rm -v ./:/etc/connector/ ghcr.io/hasura/ndc-open-api-lambda:v0.1.1 update --open-api ${url to open API document}

# with baseUrl (using env vars)
docker run --rm -v ./:/etc/connector/ -e NDC_OAS_DOCUMENT_URI=${url to open API document} -e NDC_OAS_BASE_URL=http://demoapi.com/ ghcr.io/hasura/ndc-open-api-lambda:v0.1.1 update

# with baseUrl (using CLI flags)
docker run --rm -v ./:/etc/connector/ ghcr.io/hasura/ndc-open-api-lambda:v0.1.1 update --open-api ${url to open API document} --base-url http://demoapi.com/
```

## Build and Run

You can use the Open API Connector via Docker or via the bundled CLI.

### Using Docker

Clone the repository and run the following commands to build the Docker image that can then be used for code generation.

```
cd ndc-open-api-lambda

# build the docker image with the name `ndc-oas-lambda` and tag `latest`
docker build -t ndc-oas-lambda:latest .

# get command documentation/help
docker run --rm ndc-oas-lambda:latest update -h

# when running the code generation, the container will expect either of the following two things
# 1. The OpenAPI document is mounted at `/etc/connector/` as `swagger.json`. OR
# 2. The link to the OpenAPI document is provided via the env var `NDC_OAS_DOCUMENT_URI`
# Please note that mounting a directory at /etc/connector/ is required in both cases, since that is where the code is generated

# **** START: Examples ****
# run the code generation
docker run --rm -v ./:/etc/connector/ -e NDC_OAS_DOCUMENT_URI=${url to open API document} ndc-oas-lambda:latest update

# with baseUrl
docker run --rm -v ./:/etc/connector/ -e NDC_OAS_DOCUMENT_URI=${url to open API document} -e NDC_OAS_BASE_URL=http://demoapi.com/ ndc-oas-lambda:latest update

# **** END: Examples ****

# start the NodeJS Lambda Connector
docker run --rm -p 8080:8080 -v ./:/etc/connector ndc-oas-lambda:latest
```

NOTE: You can also pass CLI flags with values to the Docker Container instead of environment variables

### Using the CLI

You can install the OpenAPI Connector as a CLI on your system. Please ensure you have NPM and Node 20+ installed. You can install and run the CLI using the following commands

```
cd ndc-open-api-lambda

# install dependencies and then install the CLI
npm i
npm run install-bin

# print help for update command
ndc-oas-lambda update -h

# **** Examples ****
# run the update command to generate code
ndc-oas-lambda update --open-api ${link/path to open api swagger document}
# with headers
ndc-oas-lambda update --open-api ${link/path to open api swagger document} -H key1=value -H key2=value2 -H keyN=valueN
# with baseurl and headers
ndc-oas-lambda update --open-api ${link/path to open api swagger document} -H key1=value -H key2=value2 -H keyN=valueN -b http://localhost:8081

# start the NodeJS Lambda Connector
npm run watch
```

## Known Limiations

- Support for [Relaxed Types](https://github.com/hasura/ndc-nodejs-lambda/tree/main?tab=readme-ov-file#relaxed-types) is a WiP.
- [Types not supported by the NodeJS Lambda Connector](https://github.com/hasura/ndc-nodejs-lambda?tab=readme-ov-file#unsupported-types) are not supported.

## Contributing

Check out our [contributing guide](./contributing.md) for more details.

## Release

Please refer to the [release doc](./release.md)

## Changelog

Please refer to the [changelog](./changelog.md)

## License

The Open API Lambda Connector is available under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).
