#! /usr/bin/env node

import { Command } from "commander";
import * as initCmd from "./init";
import * as updateCmd from "./update";
import * as validateCmd from "./validate";
import * as watchCmd from "./watch";
import { exec, execSync } from 'child_process';

export const program = new Command()
  .version("0.0.1")
  .description("OAS Connector CLI")
  .addCommand(initCmd.cmd)
  .addCommand(updateCmd.cmd)
  .addCommand(validateCmd.cmd)
  .addCommand(watchCmd.cmd)
  .action((args, cmd) => {
    console.log("Running program");
    main();
  });

program.parse(process.argv);

async function main() {
  execSync('npm run watch', {stdio: 'inherit'});
}