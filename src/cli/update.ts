import { Command, Option } from "commander";
import { exit } from "process";
import * as logger from "../util/logger";
import * as context from "../app/context";
import * as app from "../app";

export const cmd = new Command("update")
  .description(
    "Import or Re-import OpenAPI Document into your Hasura project using the NDC Typescript Lambda Connector",
  )
  .addHelpText(
    "after",
    `
Further reading:
* https://github.com/hasura/ndc-nodejs-lambda?tab=readme-ov-file#nodejs-lambda-connector
`,
  )
  .addOption(
    new Option(
      "--open-api <uri or filepath>",
      `URI or file path of OAS Document. Defaults to ${context.getInstance().getDefaultOpenapiDocumentFileUri()}`,
    )
      .default(context.getInstance().getDefaultOpenapiDocumentFileUri())
      .env("NDC_OAS_DOCUMENT_URI"),
  )
  .addOption(
    new Option("--output-directory <directory>", `Output Directory. Defaults to ${context.getInstance().getUserMountedFilePath()}`)
      .default(context.getInstance().getUserMountedFilePath())
      .env("HASURA_CONFIGURATION_DIRECTORY"),
  )
  .addOption(
    new Option("-b --base-url <value>", "Base URL of the API")
      .env("NDC_OAS_BASE_URL")
      .argParser(headerParser), // TODO why??
  )
  .addOption(
    new Option(
      "--overwrite [bool]",
      "Overwrite files if already present in the output directory.",
    )
      .default("false")
      .choices(["true", "false"])
      .preset("true")
      .env("NDC_OAS_FILE_OVERWRITE"),
  )

  .action((args, cmd) => {
    main(
      args.openApi,
      args.outputDirectory,
      args.overwrite === "true",
      args.baseUrl,
    );
  });

// convert the given array into the following format:
// key1=value1&key2=value2&key3=value3....
// because this is what the format is expected to be for the env var
function headerParser(value: string, previousValue: string[]): string[] {
  if (!value) {
    return [];
  }
  if (!previousValue) {
    return [value];
  }
  const joinedValue = `${value}&${previousValue.join("&")}`;
  return [joinedValue];
}

async function main(
  openApi: string,
  outputDir: string,
  overwrite: boolean,
  baseUrl: string | undefined,
) {
  context.getInstance().setOverwriteFiles(overwrite);
  context.getInstance().setOpenApiUri(openApi);
  context.getInstance().setOutputDirectory(outputDir);

  try {
    await app.runApp({
      openApiUri: openApi,
      baseUrl: baseUrl,
    });
  } catch (e) {
    logger.fatal(e);
    if (e instanceof Error) {
      console.log(e.message);
    }
    exit(1);
  }
}
