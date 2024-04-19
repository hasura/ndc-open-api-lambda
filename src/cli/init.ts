import { Command } from "commander";
import { resolve } from "path";
import * as logger from "../util/logger";

export const cmd = new Command("init")
  .description(
    "Import OpenAPI spec into your Hasura project using the NDC Typescript Lambda Connector",
  )
  .addHelpText(
    "after",
    `
Further reading:
* https://github.com/hasura/ndc-nodejs-lambda?tab=readme-ov-file#nodejs-lambda-connector
`,
  )
  .option(
    "--open-api <value>",
    "URI of OAS Document. Defaults to /etc/connector/swagger.json",
    "/etc/connector/swagger.json",
  )
  .option(
    "--out-dir <value>",
    "Output Directory. Defaults to /etc/connector/",
    "/etc/connector/",
  )
  .action((args, cmd) => {
    main(args.openApi, resolve(args.outDir));
  });

async function main(openApi: string, outputDir: string) {
  logger.error("This command is not implemented yet");
}
