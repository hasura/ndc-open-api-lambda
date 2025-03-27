import * as context from "../../context";
import * as ts from "ts-morph";
import * as morph from "./morph";
import path from "path";

export function preserveUserChanges(
  staleContent: string,
  freshContent: string,
): string {
  let staleProject = new ts.Project();

  let staleSourceFile = staleProject.createSourceFile(
    path.resolve(context.getInstance().getOutputDirectory(), "stale.ts"),
    staleContent,
  );

  let freshProject = new ts.Project();
  let freshSourceFile = freshProject.createSourceFile(
    path.resolve(context.getInstance().getOutputDirectory(), "fresh.ts"),
    freshContent,
  );

  morph.preserveSavedTypes(staleSourceFile, freshSourceFile);
  morph.preserveSavedInterfaces(staleSourceFile, freshSourceFile);
  morph.preserveSavedClasses(staleSourceFile, freshSourceFile);
  morph.preserveSavedVariables(staleSourceFile, freshSourceFile);
  morph.preserveSavedFunctions(staleSourceFile, freshSourceFile);

  // imports don't need @save annotation, they are always preserved and organized
  morph.preserveImportDeclarations(staleSourceFile, freshSourceFile);

  return freshSourceFile.getFullText();
}
