import * as ts from "ts-morph";
import * as types from "../../types";

export function fixImports(generatedCodeList: types.GeneratedCode[]) {
  const project = new ts.Project();
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
