import { Command } from "commander";
import { generateProject } from "../app/open-api-generator";
import { resolve } from "path";

export const cmd = new Command("update")
  .description(
    "Refresh the files generated using the `init` command. You should use this if your OpenAPI Document has changed"
  )
  .addHelpText(
    "after",
    `
Further reading:
* https://github.com/hasura/ndc-nodejs-lambda?tab=readme-ov-file#nodejs-lambda-connector
`
  )
  .option(
    "--open-api <value>",
    "URI of OAS Document. Defaults to /etc/connector/swagger.json",
    "/etc/connector/swagger.json"
  )
  .option(
    "--out-dir <value>",
    "Output Directory. Defaults to /etc/connector/",
    "/etc/connector/"
  )
  .action((args, cmd) => {
    console.log("Running command: upodate");
    console.log("args: ", args);
    console.log("open-api: ", args.openApi);
    console.log("out-dir: ", args.outDir);
    main(args.openApi, resolve(args.outDir));
  });

async function main(openApi: string, outputDir: string) {
  await generateProject(openApi, outputDir);
}
