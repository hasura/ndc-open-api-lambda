import { Command, Option } from "commander";
import { generateProject, importOpenApi } from "../app/open-api-generator";
import { resolve } from "path";

export const cmd = new Command("update")
  .description(
    "Import or Re-import OpenAPI Document into your Hasura project using the NDC Typescript Lambda Connector"
  )
  .addHelpText(
    "after",
    `
Further reading:
* https://github.com/hasura/ndc-nodejs-lambda?tab=readme-ov-file#nodejs-lambda-connector
`
  )
  .addOption(
    new Option(
      "--open-api <uri or filepath>",
      "URI or file path of OAS Document. Usually ${HASURA_CONFIGURATION_DIRECTORY}/swagger.json"
    )
      .default("./swagger.json")
      .env("HASURA_CONFIGURATION_DIRECTORY")
  )
  .addOption(
    new Option("--output-directory <directory>", "Output Directory")
      .default("./")
      .env("HASURA_CONFIGURATION_DIRECTORY")
  )
  .addOption(
    new Option(
      "--alpha <boolean>",
      "Override the generated config to support DDN Alpha."
    )
      .default("false")
      .choices(["true", "false", "0", "1"])
      .preset("true")
      .env("NDC_OAS_OVERRIDE_ALPHA")
  )
  // TODO: Add following options: header and base url
  .action((args, cmd) => {
    main(args.openApi, resolve(args.outputDirectory), args.alpha === 'true' || args.alpha === '1');
  });

async function main(
  openApi: string,
  outputDir: string,
  alphaOverride: boolean
) {
  await importOpenApi({
    openApiUri: openApi,
    outputDirectory: outputDir,
    alphaOverride: alphaOverride,
  });
}
