import * as context from "../context";
import * as fs from "fs";
import * as logger from "../../util/logger";

const NODE_VERSION = context.getInstance().getNodeVersion();

const TS_CONFIG_FILE_CONTENT = `{
  "extends": "./node_modules/@tsconfig/${NODE_VERSION}/tsconfig.json",
  "compilerOptions": {
    "lib": [
      "dom"
    ]
  }
}
`;

export function writeToFileSystem() {
  const tsConfigJsonFilePath = context.getInstance().getTsConfigFilePath();
  if (tsConfigJsonAlreadyExists()) {
    logger.info(`Overwriting file: ${tsConfigJsonFilePath}`);
  } else {
    logger.info(`Creating file: ${tsConfigJsonFilePath}`);
  }

  fs.writeFileSync(context.getInstance().getTsConfigFilePath(), TS_CONFIG_FILE_CONTENT);
}

function tsConfigJsonAlreadyExists(): boolean {
    return fs.existsSync(context.getInstance().getTsConfigFilePath());
}