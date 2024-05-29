# Open API Lambda Connector Changelog

## Unreleased

- API requests support forwarding headers that are sent to the data connector. Manual addition of headers via the `--headers` flag and `NDC_OAS_HEADERS` env var has been removed ([]()).
- Added support for adding secruity param as a query param in `api.ts` ([#27](https://github.com/hasura/ndc-open-api-lambda/pull/27))
- Added support for `@save` annotation to preserve user's changes ([#24](https://github.com/hasura/ndc-open-api-lambda/pull/24))
- Bug fix: Replaced `*/` with `*''/` in API descriptions so that multi line comments do not end pre maturely which was resulting in a syntax error ([#21](https://github.com/hasura/ndc-open-api-lambda/pull/21))

## [[0.0.2-alpha](https://github.com/hasura/ndc-open-api-lambda/releases/tag/v0.0.2-alpha)] 2024-04-19

- Added [Prettier Code Formatting](https://prettier.io/docs/en/api.html) to the generated `functions.ts` file
- Added `--ndc-lambda-sdk` flag and corresponding environment variable `NDC_LAMBDA_SDK_VERSION` that can be used to set the preferred version of NDC Lambda SDK to be used
- Return api errors that are not code 500 as `hasuraSdk.UnprocessableContent` (#14)[https://github.com/hasura/ndc-open-api-lambda/pull/14]

## [[0.0.1-alpha](https://github.com/hasura/ndc-open-api-lambda/releases/tag/v0.0.1-alpha)] 2024-04-10

- Initial release
