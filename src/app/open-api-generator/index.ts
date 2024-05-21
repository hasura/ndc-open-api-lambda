import { generateOpenApiTypescriptFile } from "./api-generator";
import * as fs from "fs";
import { generateFunctionsTypescriptFile } from "./function-generator";
import pacote from "pacote";
import { SemVer } from "semver";
import { execSync } from "child_process";
import * as logger from "../../util/logger";
import * as fileUtil from "../../util/file";
import * as context from "../context";

const PackageJson = require("@npmcli/package-json");

export async function generatePackageJson(
  outputDir: string,
  ndcLambdaSdkVersion: string | undefined,
) {
  const configuration = "./";
  const versionRestriction = "";

  const sdkPackageManifest = await pacote.manifest(
    `@hasura/ndc-lambda-sdk${versionRestriction}`,
    {},
  );

  const latestVersion = new SemVer(sdkPackageManifest.version);
  let preferredNdcLambdaSdkVersion: SemVer;

  if (ndcLambdaSdkVersion) {
    try {
      preferredNdcLambdaSdkVersion = new SemVer(ndcLambdaSdkVersion);
      await pacote.manifest(
        `@hasura/ndc-lambda-sdk@${preferredNdcLambdaSdkVersion}`,
        {},
      );
      logger.info(
        `Using NDC Lambda SDK version ${preferredNdcLambdaSdkVersion}`,
      );
    } catch (e) {
      logger.warn(
        `${ndcLambdaSdkVersion} is not a correct NDC Lambda SDK version. Using (latest) NDC Lambda SDK version: ${latestVersion}`,
      );
      preferredNdcLambdaSdkVersion = latestVersion;
    }
  } else {
    preferredNdcLambdaSdkVersion = latestVersion;
  }

  const packageJson = await PackageJson.load(outputDir, { create: true });

  logger.info("Updating package.json and installing dependencies");
  packageJson.update({
    private: true,
    engines: {
      node: ">=18",
    },
    scripts: {
      // packageJson.content.scripts === undefined ? [] : packageJson.content.scripts,
      start: `ndc-lambda-sdk host -f functions.ts serve --configuration ${configuration} --port 8080`,
      watch: `ndc-lambda-sdk host -f functions.ts --watch serve --configuration ${configuration} --pretty-print-logs --port 8080`,
    },
    dependencies: {
      // ...packageJson.content.dependencies,
      "@hasura/ndc-lambda-sdk": `${preferredNdcLambdaSdkVersion}`,
    },
  });
  await packageJson.save();

  execSync("npm install", { stdio: "inherit" });
  logger.info("npm install complete -- all dependencies installed");
}

export async function generateCode(
  openApiUri: string,
  outputDir: string,
  shouldOverwrite: boolean,
  headers: string | undefined,
  baseUrl: string | undefined,
): Promise<string> {
  const apiComponents = await generateOpenApiTypescriptFile(
    "api.ts",
    fileUtil.isValidUrl(openApiUri) ? openApiUri : undefined,
    fileUtil.isValidUrl(openApiUri)
      ? undefined
      : fileUtil.getFilePath(openApiUri),
    outputDir,
    undefined,
    shouldOverwrite,
  );

  const functionFileStr = await generateFunctionsTypescriptFile(
    apiComponents,
    headers,
    baseUrl,
  );
  return functionFileStr;
}

export type ImportOpenApiArgs = {
  headers: string | undefined; // format: key1=value1&key2=value2&key3=value3...
  baseUrl: string | undefined;
  ndcLambdaSdkVersion: string | undefined;
};

export async function importOpenApi(args: ImportOpenApiArgs) {
  const outputDirectory = context.getInstance().getOutputDirectory();
  const openApiUri = context.getInstance().getOpenApiUri();
  const overwriteFilesEnabled = context.getInstance().isOverwriteFilesEnabled();
  const functionFileContent = await generateCode(
    openApiUri,
    outputDirectory,
    overwriteFilesEnabled,
    args.headers,
    args.baseUrl,
  );

  if (!overwriteFilesEnabled) {
    if (fs.existsSync(context.getInstance().getFunctionsFilePath())) {
      logger.error(
        `Error: functions.ts already exists at ${outputDirectory}\n\nSet env var NDC_OAS_FILE_OVERWRITE=true to enable file overwrite`,
      );
      process.exit(0);
    }
    if (fs.existsSync(context.getInstance().getPackageJsonFilePath())) {
      logger.error(
        `Error: package.json already exists at ${outputDirectory}\n\nSet env var NDC_OAS_FILE_OVERWRITE=true to enable file overwrite`,
      );
      process.exit(0);
    }
    if (fs.existsSync(context.getInstance().getTsConfigFilePath())) {
      logger.error(
        `Error: tsconfig.json already exists at ${outputDirectory}\n\nSet env var NDC_OAS_FILE_OVERWRITE=true to enable file overwrite`,
      );
      process.exit(0);
    }
  }

  logger.info(
    `creating functions file at: ${context.getInstance().getFunctionsFilePath()}`,
  );
  fs.writeFileSync(
    context.getInstance().getFunctionsFilePath(),
    functionFileContent,
  );

  await generatePackageJson(outputDirectory, args.ndcLambdaSdkVersion);

  logger.info(`creating file: ${context.getInstance().getTsConfigFilePath()}`);
  fs.writeFileSync(
    context.getInstance().getTsConfigFilePath(),
    context.TS_CONFIG_FILE_CONTENT,
  );
}
