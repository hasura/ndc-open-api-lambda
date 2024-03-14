# OpenAPI Lambda Connector
The OpenAPI Lambda Connector allows you to import APIs that have an OpenAPI/Swagger Documentation into the Hasura Supergraph. It works by creating the Types and API Calls required in Typescript and wrapping those API calls in functions. These functions are can then be exposed as queries or mutations via the [NodeJS Lambda Connector](https://github.com/hasura/ndc-nodejs-lambda). 

Functions that wrap GET requests are marked with `@readonly` annotation, and are exposed as GraphQL Queries by the [NodeJS Lambda Connector](https://github.com/hasura/ndc-nodejs-lambda). All other request types are exposed as GraphQL Mutations.

## Important
This connector is under active development right now and is not stable. It has known limitations and might have undocumented issues. Please create an issue if you run into any problems.

## Build and Run
Clone the repository and run the following commands to get the connector running. Please ensure that you have NodeJS v18+ installed.
```
# install dependencies
npm i

# build and install the package
npm run build && npm link

# run the code generation for Open API documentation
npx yo hasura-ndc-nodejs-lambda --open-api ${link-or-path-to-open-api-doc}

# start the NodeJS Lambda Connector
npm run watch
```

## Supported Request Types
Request Type | Query | Path | Body | Headers
--- | --- | --- | --- | --- 
GET | y | y | NA | Not Tested
POST | y | y | y | Not Tested
DELETE | y | y | y | Not Tested
PUT | y | y | y | Not Tested
PATCH | y | y | y | Not Tested


## Known Limiations
- [Types not supported by the NodeJS Lambda Connector](https://github.com/hasura/ndc-nodejs-lambda?tab=readme-ov-file#unsupported-types) are not supported
- [Relaxed Types](https://github.com/hasura/ndc-nodejs-lambda?tab=readme-ov-file#relaxed-types) inside object types are not supported