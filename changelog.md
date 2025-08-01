# Open API Lambda Connector Changelog

## Unreleased

## [[1.7.1](https://github.com/hasura/ndc-open-api-lambda/releases/tag/v1.7.1)] 2025-07-22

- Freeze `ndc-nodejs-lambda` to `v1.15.0` ([#100](https://github.com/hasura/ndc-open-api-lambda/pull/100))

## [[1.7.0](https://github.com/hasura/ndc-open-api-lambda/releases/tag/v1.7.0)] 2025-07-15

- Update NDC NodeJS Lambda to `v1.15.0` ([#98](https://github.com/hasura/ndc-open-api-lambda/pull/98))
- Add support for `.npmrc` ([#96](https://github.com/hasura/ndc-open-api-lambda/pull/96))
- Fix user mounted file path detection ([#97](https://github.com/hasura/ndc-open-api-lambda/pull/97))

## [[1.6.1](https://github.com/hasura/ndc-open-api-lambda/releases/tag/v1.6.1)] 2025-05-12

- Update dependencies. Also update ndc-nodejs-lambda to `v1.14.0` ([#93](https://github.com/hasura/ndc-open-api-lambda/pull/93))

## [[1.6.0](https://github.com/hasura/ndc-open-api-lambda/releases/tag/v1.6.0)] 2025-03-28

- Add support for `@save` in `api.ts` ([#89](https://github.com/hasura/ndc-open-api-lambda/pull/89))
- Add support for preserving imports from stale files ([#90](https://github.com/hasura/ndc-open-api-lambda/pull/90))

## [[1.5.2](https://github.com/hasura/ndc-open-api-lambda/releases/tag/v1.5.2)] 2025-03-25

- Update dependencies. Also update ndc-nodejs-lambda to `v1.12.0` ([#87](https://github.com/hasura/ndc-open-api-lambda/pull/87))

## [[1.5.1](https://github.com/hasura/ndc-open-api-lambda/releases/tag/v1.5.1)] 2025-03-10

- Set `allowrelaxedtypes` annotation for every function (API) ([#85](https://github.com/hasura/ndc-open-api-lambda/pull/85))

- Fix param parsing of `anyOf`, `allOf` and `oneOf` ([#83](https://github.com/hasura/ndc-open-api-lambda/pull/83))

## [[1.5.0](https://github.com/hasura/ndc-open-api-lambda/releases/tag/v1.5.0)] 2025-03-07

- Update NDC NodeJS Lambda to `v1.11.0` [#80](https://github.com/hasura/ndc-open-api-lambda/pull/80)

- Add native toolchain support [#79](https://github.com/hasura/ndc-open-api-lambda/pull/79)

## [[1.3.0](https://github.com/hasura/ndc-open-api-lambda/releases/tag/v1.3.0)] 2025-01-22

- Extend `@save` annotation support for user defined type (types, interfaces, classes) ([#71](https://github.com/hasura/ndc-open-api-lambda/pull/71))
- Remove `--overwrite` flag from help for overwrite behaviour ([#76](https://github.com/hasura/ndc-open-api-lambda/pull/76))
- Add `@allowrelaxedtypes` annotation support for response types ([#74](https://github.com/hasura/ndc-open-api-lambda/pull/74))

## [[1.2.0](https://github.com/hasura/ndc-open-api-lambda/releases/tag/v1.2.0)] 2024-12-11

- Extend @save annotation support for variable declaration statements ([#68](https://github.com/hasura/ndc-open-api-lambda/pull/68))

## [[1.1.0](https://github.com/hasura/ndc-open-api-lambda/releases/tag/v1.1.0)] 2024-11-28

- Read the value of `NDC_OAS_BASE_URL` at runtime instead of build time ([#66](https://github.com/hasura/ndc-open-api-lambda/pull/66))

## [[1.0.0](https://github.com/hasura/ndc-open-api-lambda/releases/tag/v1.0.0)] 2024-11-07

## [[0.2.0](https://github.com/hasura/ndc-open-api-lambda/releases/tag/v0.2.0)] 2024-09-26

- Several bugfixes in `functions.ts` codegen due to integration of new parsers ([#50](https://github.com/hasura/ndc-open-api-lambda/pull/50))

## [[0.1.5](https://github.com/hasura/ndc-open-api-lambda/releases/tag/v0.1.5)] 2024-09-23

- Bugfix: `hasuraSdk.JSONValue` being serialized as null ([#58](https://github.com/hasura/ndc-open-api-lambda/pull/58))
- Update NDC NodeJS Lambda SDK version to `v1.8.0`. ([#59](https://github.com/hasura/ndc-open-api-lambda/pull/59))
- Add more detailed error handling ([#49](https://github.com/hasura/ndc-open-api-lambda/pull/49))

## [[0.1.4](https://github.com/hasura/ndc-open-api-lambda/releases/tag/v0.1.4)] 2024-09-12

- Fix spelling ([#55](https://github.com/hasura/ndc-open-api-lambda/pull/55))

## [[0.1.3](https://github.com/hasura/ndc-open-api-lambda/releases/tag/v0.1.3)] 2024-09-09

- Update NDC NodeJS Lambda SDK version to `v1.7.0`. ([#53](https://github.com/hasura/ndc-open-api-lambda/pull/53))

## [[0.1.2](https://github.com/hasura/ndc-open-api-lambda/releases/tag/v0.1.2)] 2024-09-02

- Add compatibilty for Windows Powershell and Command Prompt. ([#51](https://github.com/hasura/ndc-open-api-lambda/pull/51))

- Use `hasuraSdk.JSONValue` as the type for `Record<>` and `object`. Also, make APIs that don't have a return type return `hasuraSdk.JSONValue` instead of `void` (39)[https://github.com/hasura/ndc-open-api-lambda/pull/39]

## [[0.1.1](https://github.com/hasura/ndc-open-api-lambda/releases/tag/v0.1.1)] 2024-06-05

- remove unused imports, organize imports and fix import issues ([#32](https://github.com/hasura/ndc-open-api-lambda/pull/32))

## [[0.1.0](https://github.com/hasura/ndc-open-api-lambda/releases/tag/v0.1.0)] 2024-06-03

- Update `ghcr.io/hasura/ndc-nodejs-lambda` to version `v1.4.0` and remove env var `NDC_LAMBDA_SDK_VERSION` ([#30](https://github.com/hasura/ndc-open-api-lambda/pull/30)).
- API requests support forwarding headers that are sent to the data connector. Manual addition of headers via the `--headers` flag and `NDC_OAS_HEADERS` env var has been removed ([#28](https://github.com/hasura/ndc-open-api-lambda/pull/28)).
- Added support for adding secruity param as a query param in `api.ts` ([#27](https://github.com/hasura/ndc-open-api-lambda/pull/27))
- Added support for `@save` annotation to preserve user's changes ([#24](https://github.com/hasura/ndc-open-api-lambda/pull/24))
- Bug fix: Replaced `*/` with `*''/` in API descriptions so that multi line comments do not end pre maturely which was resulting in a syntax error ([#21](https://github.com/hasura/ndc-open-api-lambda/pull/21))

## [[0.0.2-alpha](https://github.com/hasura/ndc-open-api-lambda/releases/tag/v0.0.2-alpha)] 2024-04-19

- Added [Prettier Code Formatting](https://prettier.io/docs/en/api.html) to the generated `functions.ts` file
- Added `--ndc-lambda-sdk` flag and corresponding environment variable `NDC_LAMBDA_SDK_VERSION` that can be used to set the preferred version of NDC Lambda SDK to be used
- Return api errors that are not code 500 as `hasuraSdk.UnprocessableContent` (#14)[https://github.com/hasura/ndc-open-api-lambda/pull/14]

## [[0.0.1-alpha](https://github.com/hasura/ndc-open-api-lambda/releases/tag/v0.0.1-alpha)] 2024-04-10

- Initial release
