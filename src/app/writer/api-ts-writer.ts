import * as types from "../types";
import * as fs from "fs";
import * as logger from "../../util/logger";

export class SimilarFileContentsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SimilarFileContentsError";
  }
}

export function writeToFileSystem(codeToWrite: types.GeneratedCode) {
  if (!fs.existsSync(codeToWrite.filePath)) {
    logger.info(`Creating ${codeToWrite.filePath}`);
    fs.writeFileSync(codeToWrite.filePath, codeToWrite.fileContent);
    return;
  }

  const staleFile = fs.readFileSync(codeToWrite.filePath).toString();
  const shouldOverwrite = staleFile !== codeToWrite.fileContent;

  if (!shouldOverwrite) {
    throw new SimilarFileContentsError(
      `'${codeToWrite.filePath}' already represents the latest OpenAPI Document`,
    );
  }

  logger.info(`Overwriting ${codeToWrite.filePath}`);
  fs.writeFileSync(codeToWrite.filePath, codeToWrite.fileContent);
}
