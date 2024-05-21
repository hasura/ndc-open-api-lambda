import * as types from "../types";
import * as fs from "fs";
import * as tsParser from "../ts-parser";
import * as prettier from "prettier";
import * as logger from "../../util/logger";

export async function writeToFileSystem(codeToWrite: types.GeneratedCode) {
  if (!fs.existsSync(codeToWrite.filePath)) {
    logger.info(`Creating ${codeToWrite.filePath}`);
    fs.writeFileSync(codeToWrite.filePath, codeToWrite.fileContent);
    return;
  }

  logger.info(`Overwriting ${codeToWrite.filePath}`);
  const staleFile = fs.readFileSync(codeToWrite.filePath).toString();

  let freshFile = tsParser.preserveUserChanges(
    staleFile,
    codeToWrite.fileContent,
  );

  try {
    freshFile = await prettier.format(freshFile, {
      parser: "typescript",
    });
  } catch (e) {
    logger.error(
      "Error while formatting code. The resulting code will be unformatted and may contain syntax errors. Error: ",
      e,
    );
  }

  fs.writeFileSync(codeToWrite.filePath, freshFile);
}
