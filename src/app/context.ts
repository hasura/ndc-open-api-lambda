import * as path from "path";
import * as fs from "fs";
import * as logger from "../util/logger";
import { exit } from "process";

export function getInstance(): Context {
  return Context.getInstance();
}

type Configuration = {
  outputDirectory?: string;
  apiFileName: string;
  functionsFileName: string;
  logLevel?: LogLevel;
  prettyLogs: boolean;

  openApiUri?: string;
  overwriteFiles: boolean;
};

export enum LogLevel {
  TRACE = "trace",
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
  FATAL = "fatal",
  PANIC = "panic",
}

const PACKAGE_JSON_FILENAME = "package.json";
const TS_CONFIG_FILENAME = "tsconfig.json";

const API_TS_FILE_TEMPLATE_DIRECTORY = "./custom"; // relative path (to the template directory) of the directory that contains the eta templates for api.ts file
const FUNCTIONS_TS_FILE_TEMPLATE_DIRECTORY = "./functions"; // relative path (to the template directory) of the directory that contains the eta templates for functions.ts file

const NODE_VERSION = "node20";

export const TS_CONFIG_FILE_CONTENT = `{
  "extends": "./node_modules/@tsconfig/${NODE_VERSION}/tsconfig.json",
  "compilerOptions": {
    "lib": [
      "dom"
    ]
  }
}
`;

/**
 * Context is a singleton class that holds the configuration of the app
 */
export class Context {
  private static _instance: Context;
  private config: Configuration;

  private constructor() {
    this.config = {
      apiFileName: "api.ts",
      functionsFileName: "functions.ts",
      logLevel: this.readLogLevel(),
      prettyLogs: process.env.NDC_OAS_LAMBDA_PRETTY_LOGS === "true",
      overwriteFiles: false,
    };
  }

  public readLogLevel(): LogLevel {
    let logLevel = process.env.HASURA_PLUGIN_LOG_LEVEL
      ? process.env.HASURA_PLUGIN_LOG_LEVEL
      : LogLevel.INFO;
    if ((Object.values(LogLevel) as string[]).includes(logLevel)) {
      return logLevel as LogLevel;
    }
    return LogLevel.INFO;
  }

  public static getInstance(): Context {
    if (!this._instance) {
      this._instance = new Context();
    }
    return this._instance;
  }

  public setOutputDirectory(outputDir: string) {
    try {
      this.config.outputDirectory = path.resolve(outputDir);
    } catch (e) {
      logger.fatal(`Cannot resolve output directory path: ${path}`);
      logger.debug(e);
      exit(1);
    }
  }

  public getOutputDirectory(): string {
    if (!this.config.outputDirectory) {
      logger.fatal("No output directory set");
      throw new Error("Output Directory is null");
    }
    return this.config.outputDirectory;
  }

  public getApiFileName(): string {
    return this.config.apiFileName;
  }

  public getFunctionsFileName(): string {
    return this.config.functionsFileName;
  }

  public getApiFilePath(): string {
    return path.resolve(this.getOutputDirectory(), this.getApiFileName());
  }

  public getFunctionsFilePath(): string {
    return path.resolve(this.getOutputDirectory(), this.getFunctionsFileName());
  }

  public getPackageJsonFilePath(): string {
    return path.resolve(this.getOutputDirectory(), PACKAGE_JSON_FILENAME);
  }

  public getTsConfigFilePath(): string {
    return path.resolve(this.getOutputDirectory(), TS_CONFIG_FILENAME);
  }

  public isPrettyLogs(): boolean {
    return this.config.prettyLogs;
  }

  public getLogLevel(): LogLevel {
    return this.config.logLevel ? this.config.logLevel : LogLevel.INFO;
  }

  public setLogLevel(logLevel: LogLevel) {
    this.config.logLevel = logLevel;
    logger.resetLogger();
  }

  public setOverwriteFiles(overwrite: boolean) {
    this.config.overwriteFiles = overwrite;
  }

  public isOverwriteFilesEnabled(): boolean {
    return this.config.overwriteFiles;
  }

  public setOpenApiUri(uri: string) {
    this.config.openApiUri = uri;
  }

  public getOpenApiUri(): string {
    if (!this.config.openApiUri) {
      throw new Error("Open API URI is null");
    }
    return this.config.openApiUri;
  }

  /**
   * this function is added because the variable `__dirname` points to two different
   * locations depending on how the code is being run.
   * If the code is run via tests, it points to the directory in typescript code layout
   * otherwise it points to the genenrated javascript directory
   *
   * @returns the correct parent directory containing templates
   */
  public getTemplatesDirectory(): string {
    if (fs.existsSync(path.resolve(__dirname, "../../templates"))) {
      return path.resolve(__dirname, "../../templates");
    } else {
      return path.resolve(__dirname, "../../../templates");
    }
  }

  public getFunctionTsFileTemplateDirectory(): string {
    return path.resolve(
      this.getTemplatesDirectory(),
      FUNCTIONS_TS_FILE_TEMPLATE_DIRECTORY,
    );
  }

  public getApiTsFileTemplateDirectory(): string {
    return path.resolve(
      this.getTemplatesDirectory(),
      API_TS_FILE_TEMPLATE_DIRECTORY,
    );
  }
}
