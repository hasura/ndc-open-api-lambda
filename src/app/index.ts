import * as generator from "./generator";
import * as writer from "./writer";
import * as context from "./context";
import * as fs from "fs";
import * as logger from "../util/logger";
import { exit } from "process";
import * as types from "./types";

export async function runApp(args: types.GenerateCodeInput) {
  if (!context.getInstance().isOverwriteFilesEnabled()) {
    if (fs.existsSync(context.getInstance().getApiFilePath())) {
      logger.fatal(
        `Error: overwriting is disabled and api.ts file already exists at ${context.getInstance().getApiFilePath()}. To enable file overwrite, please set 'NDC_OAS_FILE_OVERWRITE' environment variable to true, or, use the --overwrite flag`,
      );
      exit(0);
    }
    if (fs.existsSync(context.getInstance().getFunctionsFilePath())) {
      logger.fatal(
        `Error: overwriting is disabled and functions.ts file already exists at ${context.getInstance().getFunctionsFilePath()}. To enable file overwrite, please set 'NDC_OAS_FILE_OVERWRITE' environment variable to true, or, use the --overwrite flag`,
      );
      exit(0);
    }
  }

  const generatedCode = await generator.generateCode(args);
  await writer.writeToFileSystem(generatedCode);
}
