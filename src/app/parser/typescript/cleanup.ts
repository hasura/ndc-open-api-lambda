import * as ts from "ts-morph";
import * as types from "../../types";
import * as context from "../../context";
import * as logger from "../../../util/logger";
import * as fs from "fs";
import * as path from "path";

export function fixImports(generatedCodeList: types.GeneratedCode[]) {
  let project: ts.Project;
  if (fs.existsSync(context.getInstance().getTsConfigFilePath())) {
    project = new ts.Project({
      tsConfigFilePath: context.getInstance().getTsConfigFilePath(),
    });
  } else {
    project = new ts.Project();
  }

  for (const generatedCode of generatedCodeList) {
    project.createSourceFile(
      generatedCode.filePath,
      generatedCode.fileContent,
      {
        overwrite: true,
      },
    );
  }

  try {
    for (const sourceFile of project.getSourceFiles()) {
      sourceFile.fixMissingImports().organizeImports();

      // find the source file in the generated code file list
      let curSourceFile =
        generatedCodeList.filter(
          (item) => item.filePath === sourceFile.getFilePath(),
        )[0] ??
        // if the source file is not found by path comparison, try to find it by comparing the file name
        generatedCodeList.filter(
          (item) =>
            path.basename(item.filePath) ===
            path.basename(sourceFile.getFilePath()),
        )[0];

      if (curSourceFile) {
        curSourceFile!.fileContent = sourceFile.getFullText();
      } else {
        logger.error(
          `Error while fixing imports: Unable to find the source file for ${sourceFile.getFilePath()}\n\nSkipping import fixing and cleanup for this file`,
        );
      }
    }
  } catch (error) {
    logger.error("Error while fixing imports. Skipping", error);
  }
}
