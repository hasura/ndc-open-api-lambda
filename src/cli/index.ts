#! /usr/bin/env node

import { Command } from "commander";
import * as updateCmd from "./update";
import { exec, execSync } from "child_process";

export const program = new Command()
  .version("0.1.2")
  .description("OAS Connector CLI")
  // .addCommand(initCmd.cmd) TODO: Enable when required by the CLI spec
  .addCommand(updateCmd.cmd)
  // .addCommand(validateCmd.cmd) TODO: Enable when required by the CLI spec
  // .addCommand(watchCmd.cmd) TODO: Enable when required by the CLI spec
  .action(() => {
    main();
  });

program.parse(process.argv);

async function main() {
  execSync("npm run watch", { stdio: "inherit" });
}
