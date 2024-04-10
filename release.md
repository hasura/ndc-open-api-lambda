# Release
The NDC Open API Lambda Connector uses GitHub Releases for release management.

## Release Process
1. Use Git Tags for release. Tags should be in the format of Semver: `vMajor.Minor.Patch`. Release branches should have the format `release/{version}`
2. Publish a Docker Image to GHCR with the name `ghcr.io/hasura/ndc-open-api-lambda` and the version tagged with the Git Tag created in Step 1 More on [GHRC](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
3. Add the tagged version of the Docker Image in the `update` command of the connector-metadata [here](https://github.com/hasura/ndc-open-api-lambda/blob/bea1d291c56093cf0caf070ddaa0af2b3e4850a3/connector-definition/.hasura-connector/connector-metadata.yaml#L17)
4. Create .tgz file of `connector-definition` using the command `tar -czf connector-definition.tgz connector-definition` (MacOS)
5. Create a GitHub Release and add the .tgz file as an asset