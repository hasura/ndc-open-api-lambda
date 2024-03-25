#! /usr/bin/env node

import { Command } from "commander";
import * as initCmd from "./init";
import * as updateCmd from "./update";
import * as validateCmd from "./validate";
import * as watchCmd from "./watch";

export const program = new Command()
  .version("0.0.1")
  .description("OAS Connector CLI")
  .addCommand(initCmd.cmd)
  .addCommand(updateCmd.cmd)
  .addCommand(validateCmd.cmd)
  .addCommand(watchCmd.cmd);

program.parse(process.argv);
