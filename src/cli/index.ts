#! /usr/bin/env node

import { Command } from "commander";
import { generateProject } from "../app/open-api-generator";
import { exit } from "process";
import { resolve } from "path";

const outDir = "/etc/connector/"
const openApiUrl = "https://petstore3.swagger.io/api/v3/openapi.json";

let openApi = "";
let outputDir = "";

const program = new Command();
program.version('0.0.1')
.option('--open-api <value>', 'URI of OAS Document. Defaults to /etc/connector/swagger.json', '/etc/connector/swagger.json')
.option('--out-dir <value>', 'Output Directory. Defaults to /etc/connector/', '/etc/connector/')
.description('OAS Connector CLI')
.action((args, cmd) => {
    console.log('args: ', args);
    console.log('open-api: ', args.openApi);
    console.log('out-dir: ', args.outDir);
    openApi = args.openApi;
    outputDir = resolve(args.outDir);
    main();
});

program.parse(process.argv);

async function main() {
    await generateProject(openApi, outputDir);
    // exit(0);
}