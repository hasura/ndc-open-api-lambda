import * as fs from "fs";
import * as context from "../context";
import * as logger from "../../util/logger";
import { SemVer } from "semver";
import NPMCliPackageJson from "@npmcli/package-json";

export async function writeToFileSystem() {
  if (packageJsonExists()) {
    logger.info(
      `Updating package.json file found at ${context.getInstance().getOutputDirectory()}`,
    );
  } else {
    logger.info(
      `Creating package.json file at ${context.getInstance().getOutputDirectory()}`,
    );
  }

  const packageJson = await NPMCliPackageJson.load(
    context.getInstance().getOutputDirectory(),
    { create: true },
  );

  const scripts = getScripts(packageJson);
  const dependencies = getDependencies(
    packageJson,
    context.getInstance().getNdcNodeJsLambdaSdkVersion(),
  );

  packageJson.update({
    private: true,
    engines: {
      node: ">=18",
    },
    scripts: scripts,
    dependencies: dependencies,
  });

  await packageJson.save();
}

function getScripts(packageJson: NPMCliPackageJson) {
  let scripts: any;

  const startScript = `ndc-lambda-sdk host -f functions.ts serve --configuration ./`;
  const watchScript = `ndc-lambda-sdk host -f functions.ts --watch serve --configuration ./ --pretty-print-logs`;

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
