import * as types from "../types";
import * as fs from "fs";
import * as tsParser from "../parser/typescript";
import * as logger from "../../util/logger";
import * as cleanup from "../parser/typescript/cleanup";
import * as format from "../parser/typescript/fomat";

export async function writeToFileSystem(
  functionsTs: types.GeneratedCode,
  apiTs: types.GeneratedCode,
) {
  if (!fs.existsSync(functionsTs.filePath)) {
    logger.info(`Creating ${functionsTs.filePath}`);
    await writeContentToFile(functionsTs, apiTs);
    return;
  }

  logger.info(`Overwriting ${functionsTs.filePath}`);
  const staleFile = fs.readFileSync(functionsTs.filePath).toString();

  functionsTs.fileContent = tsParser.preserveUserChanges(
    staleFile,
    functionsTs.fileContent,
  );

  await writeContentToFile(functionsTs, apiTs);
}

async function writeContentToFile(
  functionsTs: types.GeneratedCode,
  apiTs: types.GeneratedCode,
) {
  await cleanupAndFormat(functionsTs, apiTs);
  fs.writeFileSync(functionsTs.filePath, functionsTs.fileContent);
}

export async function cleanupAndFormat(
  functionsTs: types.GeneratedCode,
  apiTs: types.GeneratedCode,
) {
  cleanup.fixImports([functionsTs, apiTs]);
  functionsTs.fileContent = await format.format(functionsTs.fileContent);
}
