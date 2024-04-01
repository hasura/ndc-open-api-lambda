import { generateOpenApiTypescriptFile } from "./api-generator";
import * as path from "path";
import * as fs from "fs";
import { generateFunctionsTypescriptFile } from "./function-generator";
import pacote from "pacote";
import { SemVer } from "semver";
import { version } from "../../../package.json";
import { exec, execSync } from "child_process";
import * as logger from "../../util/logger";
import * as fileUtil from "../../util/file";

const PackageJson = require("@npmcli/package-json");

/**
 * this function is added because the variable `__dirname` points to two different
 * locations depending on how the code is being run.
 * If the code is run via tests, it points to the directory in typescript code layout
 * otherwise it points to the genenrated javascript directory
 *
 * @returns the correct parent directory containing templates
 */
export const getTemplatesDirectory = (): string => {
  if (fs.existsSync(path.resolve(__dirname, "../../../templates"))) {
    return path.resolve(__dirname, "../../../templates");
  } else {
    return path.resolve(__dirname, "../../../../templates");
  }
};

const tsConfigBetaContent = `{
  "extends": "./node_modules/@tsconfig/node20/tsconfig.json",
  "compilerOptions": {
    "lib": [
      "dom"
    ]
  }
}
`;

export async function generateAlphaPackageJson(outputDir: string) {
  logger.info("Generating Alpha compatible scripts");
  logger.warn(
    "Alpha version is deprecated and will no longer be support. Please consider updating to Beta"
  );

  fs.writeFileSync(path.resolve(outputDir, "configuration.json"), `{}`);

  const packageManifest = await pacote.manifest(
    "generator-hasura-ndc-nodejs-lambda" // todo: change the name to this package name
  );
  const latestVersion = new SemVer(packageManifest.version);
  const currentVersion = new SemVer(version);

  logger.debug("checking for update");
  if (currentVersion.compare(latestVersion) === -1) {
    logger.info(
      `Upate available: A newer version (${latestVersion}) is available`
    );
  } else {
    logger.debug(`Already on latest version`);
  }

  const configuration = "configuration.json";
  const versionRestriction = "";

  const sdkPackageManifest = await pacote.manifest(
    `@hasura/ndc-lambda-sdk${versionRestriction}`,
    {}
  );
  const packageJson = await PackageJson.load(outputDir, { create: true }); //.load(outputDir, { create: true });
  // packageJson.load(outputDir, { create: true });

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
      "@hasura/ndc-lambda-sdk": "0.16.0",
    },
  });
  await packageJson.save();

  execSync("npm install", { stdio: "inherit" });
  logger.info("npm install complete -- all dependencies installed");
}

export async function generatePackageJson(outputDir: string) {
  const packageManifest = await pacote.manifest(
    "generator-hasura-ndc-nodejs-lambda" // todo: change the name to this package name
  );
  const latestVersion = new SemVer(packageManifest.version);
  const currentVersion = new SemVer(version);

  logger.debug("checking for update");
  if (currentVersion.compare(latestVersion) === -1) {
    logger.info(
      `Upate available: A newer version (${latestVersion}) is available`
    );
  } else {
    logger.debug(`Already on latest version`);
  }

  const configuration = "./";
  const versionRestriction = "";

  const sdkPackageManifest = await pacote.manifest(
    `@hasura/ndc-lambda-sdk${versionRestriction}`,
    {}
  );
  const packageJson = await PackageJson.load(outputDir, { create: true }); //.load(outputDir, { create: true });
  // packageJson.load(outputDir, { create: true });

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
      "@hasura/ndc-lambda-sdk": sdkPackageManifest.version,
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
    fileUtil.isValidUrl(openApiUri) ? undefined : fileUtil.getFilePath(openApiUri),
    outputDir,
    undefined,
    shouldOverwrite,
  );

  const functionFileStr = generateFunctionsTypescriptFile(apiComponents, headers, baseUrl);
  return functionFileStr;
}

export async function generateProject(openApiUri: string, outputDir: string, headers: string | undefined, baseUrl: string | undefined) {
  const functionFileTs = await generateCode(openApiUri, outputDir, true, headers, baseUrl);

  fs.writeFileSync(path.resolve(outputDir, "functions.ts"), functionFileTs);
  logger.info("created functions.ts");

  await generatePackageJson(outputDir);

  fs.writeFileSync(path.resolve(outputDir, "tsconfig.json"), tsConfigBetaContent);
}

export type ImportOpenApiArgs = {
  openApiUri: string,
  outputDirectory: string,
  alphaOverride: boolean,
  shouldOverwrite: boolean,
  headers: string | undefined, // format: key1=value1&key2=value2&key3=value3...
  baseUrl: string | undefined,
}

export async function importOpenApi(args: ImportOpenApiArgs) {
  const functionFileTs = await generateCode(args.openApiUri, args.outputDirectory, args.shouldOverwrite, args.headers, args.baseUrl);

  if (!args.shouldOverwrite) {
    if (fs.existsSync(path.resolve(args.outputDirectory, 'functions.ts'))) {
      throw new Error(`Error: functions.ts already exists at ${args.outputDirectory}\n\nSet env var NDC_OAS_FILE_OVERWRITE=true to enable file overwrite`);
    }
    if (fs.existsSync(path.resolve(args.outputDirectory, 'package.json'))) {
      throw new Error(`Error: package.json already exists at ${args.outputDirectory}\n\nSet env var NDC_OAS_FILE_OVERWRITE=true to enable file overwrite`);
    }
    if (fs.existsSync(path.resolve(args.outputDirectory, 'tsconfig.json'))) {
      throw new Error(`Error: tsconfig.json already exists at ${args.outputDirectory}\n\nSet env var NDC_OAS_FILE_OVERWRITE=true to enable file overwrite`);
    }
  }

  logger.info("create functions.ts");
  fs.writeFileSync(path.resolve(args.outputDirectory, "functions.ts"), functionFileTs);

  if (args.alphaOverride) {
    await generateAlphaPackageJson(args.outputDirectory)
  } else {
    await generatePackageJson(args.outputDirectory);
  }

  logger.info('create tsconfig.json');
  fs.writeFileSync(path.resolve(args.outputDirectory, "tsconfig.json"), tsConfigBetaContent); 
}
