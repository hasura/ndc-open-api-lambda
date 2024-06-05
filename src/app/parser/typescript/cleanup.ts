import * as ts from "ts-morph";
import * as types from "../../types";
import * as context from "../../context";
import * as fs from "fs";

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

  for (const sourceFile of project.getSourceFiles()) {
    sourceFile.fixMissingImports().organizeImports();

    const code = generatedCodeList.filter(
      (item) => item.filePath === sourceFile.getFilePath(),
    )[0]!;
    code.fileContent = sourceFile.getFullText();
  }
}
