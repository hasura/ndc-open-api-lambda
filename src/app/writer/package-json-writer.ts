import pacote from "pacote";
import * as fs from "fs";
import * as context from "../context";
import * as logger from "../../util/logger";
import { SemVer } from "semver";
import NPMCliPackageJson, * as PackageJson from "@npmcli/package-json";

async function writePackageJsonToFileSystem() {
  const ndcNodeJsLambdaSdkVersion = await getNdcNodeJsLambdaSdkVersion();

  if (packageJsonExists()) {
    logger.info(
      `Updating package.json file found at ${context.getInstance().getOutputDirectory()}`,
    );
  } else {
    logger.info(
      `Creating package.json file at ${context.getInstance().getOutputDirectory()}`,
    );
  }

  const packageJson = await PackageJson.load(
    context.getInstance().getOutputDirectory(),
    { create: true },
  );

  const scripts = getScripts(packageJson);
  const dependencies = getDependencies(packageJson, ndcNodeJsLambdaSdkVersion);

  packageJson.update({
    private: true,
    engines: {
      node: ">=18",
    },
    scripts: scripts,
    dependencies: dependencies,
  });
}

function getScripts(packageJson: NPMCliPackageJson) {
  let scripts: any;

  const startScript = `ndc-lambda-sdk host -f functions.ts serve --configuration ./ --port 8080`;
  const watchScript = `ndc-lambda-sdk host -f functions.ts --watch serve --configuration ./ --pretty-print-logs --port 8080`;

  if (packageJson.content.scripts) {
    scripts = {
      ...packageJson.content.scripts,
      start: startScript,
      watch: watchScript,
    };
  } else {
    scripts = {
      start: startScript,
      watch: watchScript,
    };
  }
  return scripts;
}

function getDependencies(
  packageJson: NPMCliPackageJson,
  ndcNodeJsLambdaSdkVersion: SemVer,
) {
  let dependencies: any;

  if (packageJson.content.dependencies) {
    dependencies = {
      ...packageJson.content.dependencies,
      "@hasura/ndc-lambda-sdk": `${ndcNodeJsLambdaSdkVersion}`,
    };
  } else {
    dependencies = {
      "@hasura/ndc-lambda-sdk": `${ndcNodeJsLambdaSdkVersion}`,
    };
  }
  return dependencies;
}

function packageJsonExists(): boolean {
  return fs.existsSync(context.getInstance().getPackageJsonFilePath());
}

async function getNdcNodeJsLambdaSdkVersion(): Promise<SemVer> {
  try {
    await pacote.manifest(
      `@hasura/ndc-lambda-sdk@${context.getInstance().getNdcNodeJsLambdaSdkVersion()}`,
      {},
    );

    return context.getInstance().getNdcNodeJsLambdaSdkVersion();
  } catch (e) {
    const latestNdcNodeJsLambdaSdkVersion =
      getLatestNdcNodeJsLambdaSdkVersion();
    logger.error(
      `Error while fetching NDC NodeJS Lambda SDK Version: ${context.getInstance().getNdcNodeJsLambdaSdkVersion()}. Using the latest version (${latestNdcNodeJsLambdaSdkVersion}) instead`,
    );
    return latestNdcNodeJsLambdaSdkVersion;
  }
}

async function getLatestNdcNodeJsLambdaSdkVersion(): Promise<SemVer> {
  const ndcNodeJsLambdaPackageManifest = await pacote.manifest(
    `@hasura/ndc-lambda-sdk`,
    {},
  );

  return new SemVer(ndcNodeJsLambdaPackageManifest.version);
}
