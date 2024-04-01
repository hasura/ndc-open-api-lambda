import { Command, Option } from "commander";
import { generateProject, importOpenApi } from "../app/open-api-generator";
import { resolve } from "path";
import { exit } from "process";
import * as logger from "../util/logger";

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
      .env("NDC_OAS_DOCUMENT_URI")
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
  .addOption(
    new Option(
      "--overwrite <boolean>",
      "Overwrite files if already present in the output directory."
    )
      .default("false")
      .choices(["true", "false", "0", "1"])
      .preset("true")
      .env("NDC_OAS_FILE_OVERWRITE")
  )
  // TODO: Add following options: header and base url
  .action((args, cmd) => {
    main(args.openApi, resolve(args.outputDirectory), args.alpha === 'true' || args.alpha === '1', args.overwrite === 'true' || args.overwrite === '1');
  });

async function main(
  openApi: string,
  outputDir: string,
  alphaOverride: boolean,
  overwrite: boolean,
) {
  try {
    await importOpenApi({
      openApiUri: openApi,
      outputDirectory: outputDir,
      alphaOverride: alphaOverride,
      shouldOverwrite: overwrite,
    });
  } catch (e) {
    logger.fatal(e);
    if (e instanceof Error) {
      console.log(e.message);
    }
    exit(1);
  }
}
