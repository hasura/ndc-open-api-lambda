import * as types from "../types";
import * as fs from "fs";
import * as diff from "../../util/text-diff";
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
  const shouldOverwrite = diff.hasDiff(staleFile, codeToWrite.fileContent);

  if (!shouldOverwrite) {
    throw new SimilarFileContentsError(
      `'${codeToWrite.fileContent}' already represents the latest OpenAPI Document`,
    );
  }

  logger.info(`Overwriting ${codeToWrite.filePath}`);
  fs.writeFileSync(codeToWrite.filePath, codeToWrite.fileContent);
}
