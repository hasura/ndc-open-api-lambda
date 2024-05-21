import * as diff from "diff";

export function hasDiff(text_1: string, text_2: string): boolean {
  const calculatedDiff = diff.diffChars(text_1, text_2);
  if (calculatedDiff && calculatedDiff.length > 0) {
    return true;
  }
  return false;
}