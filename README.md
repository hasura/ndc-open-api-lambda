# OpenAPI Lambda Connector

[![Docs](https://img.shields.io/badge/docs-v3.x-brightgreen.svg?style=flat)](https://hasura.io/docs/3.0/getting-started/overview/)
[![ndc-hub](https://img.shields.io/badge/ndc--hub-postgres-blue.svg?style=flat)](https://hasura.io/connectors)
[![License](https://img.shields.io/badge/license-Apache--2.0-purple.svg?style=flat)](LICENSE.txt)
[![Status](https://img.shields.io/badge/status-alpha-yellow.svg?style=flat)](./readme.md)

The OpenAPI Lambda Connector allows you to import APIs that have an OpenAPI/Swagger Documentation into the Hasura Supergraph. It works by creating the Types and API Calls required in Typescript and wrapping those API calls in functions. These functions can then be exposed as queries or mutations via the [NodeJS Lambda Connector](https://github.com/hasura/ndc-nodejs-lambda).

Functions that wrap GET requests are marked with `@readonly` annotation, and are exposed as GraphQL Queries by the [NodeJS Lambda Connector](https://github.com/hasura/ndc-nodejs-lambda). All other request types are exposed as GraphQL Mutations.

- [Hasura V3 Documentation](https://hasura.io/docs/3.0)
- [NodeJS Lambda Connector](https://github.com/hasura/ndc-nodejs-lambda)

## Important

This connector is under active development right now and is not stable. It has [known limitations](https://github.com/hasura/ndc-open-api-lambda?tab=readme-ov-file#known-limiations) and might have undocumented issues. Please create an issue if you run into any problems.

## Features

- Convert Open API/swagger documentation into Typescript functions compatible with NodeJS Lambda Connector
- Supported request types

| Request Type | Query | Path | Body | Headers              |
| ------------ | ----- | ---- | ---- | -------------------- |
| GET          | y     | y    | NA   | Need Manual Addition |
| POST         | y     | y    | y    | Need Manual Addition |
| DELETE       | y     | y    | y    | Need Manual Addition |
| PUT          | y     | y    | y    | Need Manual Addition |
| PATCH        | y     | y    | y    | Need Manual Addition |

## Before you get Started

- Please ensure that you have [downloaded and installed the DDN CLI](https://hasura.io/docs/3.0/cli/installation/).
- Please ensure that you have Docker installed and the Docker Daemon is running.

## For Hasura Users

The Connector can be used with the DDN CLI. Use the `ddn dev` command to tell the CLI to automatically deploy, build and manage the Connector. Individual CLI Commands to build and deploy the Connector can be found [here](https://hasura.io/docs/3.0/cli/commands/)

## Documentation

This connector is published as a Docker Image. The image name is `ghcr.io/hasura/ndc-open-api-lambda`. The Docker Image accepts the following environment variables that can be used to alter its functionality. These variables, if present in the `ConnectorManifest` of your DDN Metadata, will be passed by the DDN CLI to the Connector.

1. `NDC_OAS_DOCUMENT_URI`: The URI to your Open API Document. If you're using a file instead of a HTTP link, please ensure that it is named `swagger.json` and is present in the root directory of the volume being mounted to `/etc/connector`. This env var is nullable.
2. `NDC_OAS_BASE_URL`: The base URL of your API. This env var is nullable.
3. `NDC_OAS_HEADERS`: Headers to be added to your API calls. The expected syntax is `key1=value1&key2=value2&key3=value3....`. This env var is nullable.
4. `NDC_OAS_FILE_OVERWRITE`: Boolean flag to allow previously generated files to be over-written. Defaults to `false`. Please note that the codegen will fail with an error if this is set to `false` and the files that the codegen would create already exist.
5. `HASURA_PLUGIN_LOG_LEVEL`: The log level. Possible values: `trace`, `debug`, `info`, `warn`, `error`, `fatal`, `panic`. Defaults to `info`
6. `NDC_OAS_LAMBDA_PRETTY_LOGS`: Boolean flag to print human readable logs instead of JSON
7. `NDC_LAMBDA_SDK_VERSION`: NDC Lambda SDK Version to be used by the SDK. Defaults to the latest version

### Usage without the DDN CLI

The Docker Image can be used without the DDN CLI as a codegen tool for the [NDC NodeJS Lambda Connector](https://github.com/hasura/ndc-nodejs-lambda). Please see the Examples section on how to do that.

The Docker Container will output the generated files at `/etc/connector`. Please ensure that a volume mount is present at that directory while using the `docker run` command

NOTE: The Docker Container uses the NDC Open API Lambda Connector CLI internally, so `-h` on any command will print the help for that command. Also, env vars can be substituted with CLI flags passed to the `docker run` command

### Examples

```
# get command documentation/help
docker run --rm ghcr.io/hasura/ndc-open-api-lambda:v0.0.1-alpha update -h

# run the code generation (using env vars)
docker run --rm -v ./:/etc/connector/ -e NDC_OAS_DOCUMENT_URI=${url to open API document} ghcr.io/hasura/ndc-open-api-lambda:v0.0.1-alpha update

# run the code generation (using CLI flags)
docker run --rm -v ./:/etc/connector/ ghcr.io/hasura/ndc-open-api-lambda:v0.0.1-alpha update --open-api ${url to open API document}

# with headers (using env vars)
docker run --rm -v ./:/etc/connector/ -e NDC_OAS_DOCUMENT_URI=${url to open API document} -e NDC_OAS_HEADERS=${key1=value1&key2=value2&key3=value3...} ghcr.io/hasura/ndc-open-api-lambda:v0.0.1-alpha update

# with headers (using CLI flags)
docker run --rm -v ./:/etc/connector/ ghcr.io/hasura/ndc-open-api-lambda:v0.0.1-alpha update --open-api ${url to open API document} -H key1=value1 -H key2=value2 -H key3=value3

# with baseUrl (using env vars)
docker run --rm -v ./:/etc/connector/ -e NDC_OAS_DOCUMENT_URI=${url to open API document} -e NDC_OAS_BASE_URL=http://demoapi.com/ ghcr.io/hasura/ndc-open-api-lambda:v0.0.1-alpha update

# with baseUrl (using CLI flags)
docker run --rm -v ./:/etc/connector/ ghcr.io/hasura/ndc-open-api-lambda:v0.0.1-alpha update --open-api ${url to open API document} --base-url http://demoapi.com/
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

# with headers
docker run --rm -v ./:/etc/connector/ -e NDC_OAS_DOCUMENT_URI=${url to open API document} -e NDC_OAS_HEADERS=${key1=value1&key2=value2&key3=value3...} ndc-oas-lambda:latest update

# with headers and baseUrl
docker run --rm -v ./:/etc/connector/ -e NDC_OAS_DOCUMENT_URI=${url to open API document} -e NDC_OAS_HEADERS=${key1=value1&key2=value2&key3=value3...} -e NDC_OAS_BASE_URL=http://demoapi.com/ ndc-oas-lambda:latest update

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

- `Record<>` and `Map<>` return types are wrapped as JSON.
- Support for [Relaxed Types](https://github.com/hasura/ndc-nodejs-lambda/tree/main?tab=readme-ov-file#relaxed-types) is a WiP.
- [Types not supported by the NodeJS Lambda Connector](https://github.com/hasura/ndc-nodejs-lambda?tab=readme-ov-file#unsupported-types) are not supported.
- If `*/` is present in examples or descriptions, it causes a syntax error because it denotes the end of a multi line comment in Typescript. This causes the codegen to crash. This is a high priority issue that will be fixed in upcoming releases.

## Contributing

Check out our [contributing guide](./contributing.md) for more details.

## Release

Please refer to the [release doc](./release.md)

## Changelog

Please refer to the [changelog](./changelog.md)

## License

The Open API Lambda Connector is available under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).
