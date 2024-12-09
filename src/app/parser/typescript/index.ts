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

  morph.preserveSavedFunctions(staleSourceFile, freshSourceFile);

  // recalcuate nodes
  staleContent = staleSourceFile.getFullText();
  freshContent = freshSourceFile.getFullText();

  staleProject = new ts.Project();
  staleSourceFile = staleProject.createSourceFile(
    path.resolve(context.getInstance().getOutputDirectory(), "stale.ts"),
    staleContent,
  );

  freshProject = new ts.Project();
  freshSourceFile = freshProject.createSourceFile(
    path.resolve(context.getInstance().getOutputDirectory(), "fresh.ts"),
    freshContent,
  );

  morph.preserveSavedVariables(staleSourceFile, freshSourceFile);

  return freshSourceFile.getFullText();
}
