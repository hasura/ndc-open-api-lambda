import * as context from "../../context";
import * as ts from "ts-morph";
import * as morph from "./morph";
import path from "path";

export function preserveUserChanges(
  staleContent: string,
  freshContent: string,
): string {
  const staleProject = new ts.Project();

  const staleSourceFile = staleProject.createSourceFile(
    path.resolve(context.getInstance().getOutputDirectory(), "stale.ts"),
    staleContent,
  );

  const freshProject = new ts.Project();
  const freshSourceFile = freshProject.createSourceFile(
    path.resolve(context.getInstance().getOutputDirectory(), "fresh.ts"),
    freshContent,
  );

  morph.preserveSavedFunctions(staleSourceFile, freshSourceFile);

  return freshSourceFile.getFullText();
}
