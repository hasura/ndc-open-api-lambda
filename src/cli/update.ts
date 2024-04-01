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
    new Option("-H --headers <key=value...>", "Output Directory")
    .env("NDC_OAS_HEADERS")
    .argParser(headerParser)
  )
  .addOption(
    new Option(
      "--alpha",
      "Override the generated config to support DDN Alpha."
    )
      .default("false")
      .choices(["true", "false"])
      .preset("true")
      .env("NDC_OAS_OVERRIDE_ALPHA")
  )
  .addOption(
    new Option(
      "--overwrite",
      "Overwrite files if already present in the output directory."
    )
      .default("false")
      .choices(["true", "false"])
      .preset("true")
      .env("NDC_OAS_FILE_OVERWRITE")
  )
  // TODO: Add following options: header and base url
  .action((args, cmd) => {
    main(args.openApi, resolve(args.outputDirectory), args.alpha === 'true', args.overwrite === 'true', args.headers);
  });

// convert the given array into the following format:
// key1=value1&key2=value2&key3=value3....
// because this is what the format is expected to be for the env var
function headerParser(value: string, previousValue: string[]): string[] {
  if (!value) {
    return [];
  }
  if (!previousValue) {
    return [ value ];
  }
  const joinedValue = `${value}&${previousValue.join("&")}`;
  return [joinedValue];
}

async function main(
  openApi: string,
  outputDir: string,
  alphaOverride: boolean,
  overwrite: boolean,
  headers: string[],
) {
  try {
    await importOpenApi({
      openApiUri: openApi,
      outputDirectory: outputDir,
      alphaOverride: alphaOverride,
      shouldOverwrite: overwrite,
      headers: (headers && headers.length > 0) ? headers[0] : undefined, // beacuse of headerParser(), the headers array can contain only 1 element
    });
  } catch (e) {
    logger.fatal(e);
    if (e instanceof Error) {
      console.log(e.message);
    }
    exit(1);
  }
}
