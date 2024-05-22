import * as types from "../types";
import * as fs from "fs";
import * as tsParser from "../parser/typescript";
import * as prettier from "prettier";
import * as logger from "../../util/logger";

export async function writeToFileSystem(codeToWrite: types.GeneratedCode) {
  if (!fs.existsSync(codeToWrite.filePath)) {
    logger.info(`Creating ${codeToWrite.filePath}`);
    await writeContentToFile(codeToWrite.filePath, codeToWrite.fileContent);
    return;
  }

  logger.info(`Overwriting ${codeToWrite.filePath}`);
  const staleFile = fs.readFileSync(codeToWrite.filePath).toString();

  let freshFile = tsParser.preserveUserChanges(
    staleFile,
    codeToWrite.fileContent,
  );

  await writeContentToFile(codeToWrite.filePath, freshFile);
}

async function writeContentToFile(filePath: string, codeContent: string) {
  codeContent = await formatCode(codeContent);
  fs.writeFileSync(filePath, codeContent);
}

async function formatCode(code: string): Promise<string> {
  try {
    code = await prettier.format(code, {
      parser: "typescript",
    });
  } catch (e) {
    logger.error(
      "Error while formatting code. The resulting code will be unformatted and may contain syntax errors. Error: ",
      e,
    );
  }
  return code;
}
