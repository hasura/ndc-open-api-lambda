import * as types from "../types";
import * as fs from "fs";
import * as logger from "../../util/logger";
import * as tsParser from "../parser/typescript";
import * as format from "../parser/typescript/fomat";

export class SimilarFileContentsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SimilarFileContentsError";
  }
}

export async function writeToFileSystem(codeToWrite: types.GeneratedCode) {
  if (!fs.existsSync(codeToWrite.filePath)) {
    logger.info(`Creating ${codeToWrite.filePath}`);
    fs.writeFileSync(codeToWrite.filePath, codeToWrite.fileContent);
    return;
  }

  const staleFile = fs.readFileSync(codeToWrite.filePath).toString();

  logger.info(`Overwriting ${codeToWrite.filePath}`);

  codeToWrite.fileContent = tsParser.preserveUserChanges(
    staleFile,
    codeToWrite.fileContent,
  );

  await cleanupAndFormat(codeToWrite);

  fs.writeFileSync(codeToWrite.filePath, codeToWrite.fileContent);
}

export async function cleanupAndFormat(apiTs: types.GeneratedCode) {
  apiTs.fileContent = await format.format(apiTs.fileContent);
}
