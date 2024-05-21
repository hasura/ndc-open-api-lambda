import * as apiWriter from "./api-ts-writer";
import * as functionsWriter from "./functions-ts-writer";
import * as packageJsonWriter from "./package-json-writer";
import * as tsConfigWriter from "./ts-config-writer";
import * as types from "../types";
import * as logger from "../../util/logger";
import { exit } from "process";
import { execSync } from "child_process";

export async function writeToFileSystem(codeToWrite: types.GeneratedCode[]) {
  try {
    const apiTsCode = codeToWrite.filter((element) => element.fileType === "api-ts" );
    const functionsTsCode = codeToWrite.filter((element) => element.fileType === "functions-ts" );

    apiWriter.writeToFileSystem(apiTsCode[0]!);
    await functionsWriter.writeToFileSystem(functionsTsCode[0]!);
    await packageJsonWriter.writeToFileSystem();
    tsConfigWriter.writeToFileSystem();

    logger.info("running npm install :: installing dependencies");
    execSync("npm install", { stdio: "inherit" });
    logger.info("all dependencies installed");
  } catch (e) {
    if (e instanceof apiWriter.SimilarFileContentsError) {
      logger.error('api.ts is up to date, aborting writing files.', e.message);
      exit(0);
    } else {
      logger.fatal(e);
      exit(1);
    }
  }
}