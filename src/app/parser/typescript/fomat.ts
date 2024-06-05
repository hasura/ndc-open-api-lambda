import * as prettier from "prettier";
import * as logger from "../../../util/logger";

export async function format(code: string): Promise<string> {
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
