# Open API Lambda Connector Changelog

## [Unreleased]

- Added [Prettier Code Formatting](https://prettier.io/docs/en/api.html) to the generated `functions.ts` file
- Added `--ndc-lambda-sdk` flag and corresponding environment variable `NDC_LAMBDA_SDK_VERSION` that can be used to set the preferred version of NDC Lambda SDK to be used
- Return api errors that are not code 500 as `hasuraSdk.UnprocessableContent` (#14)[https://github.com/hasura/ndc-open-api-lambda/pull/14]

## [[0.0.1-alpha](https://github.com/hasura/ndc-open-api-lambda/releases/tag/v0.0.1-alpha)] 2024-04-10

- Initial release
