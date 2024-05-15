import * as path from "path";
import * as logger from "../util/logger";
import { exit } from "process";

export function getInstance(): Context {
  return Context.getInstance();
}

export type Configuration = {
  outputDir?: string;
  apiFileName: string;
  functionsFileName: string;
  logLevel?: LogLevel;
  prettyLogs: boolean;
};

export enum LogLevel {
  TRACE = "trace",
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
  FATAL = "fatal",
  PANIC = "panic"
}

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
      prettyLogs: process.env.NDC_OAS_LAMBDA_PRETTY_LOGS === 'true',
    };
  }

  public readLogLevel(): LogLevel {
    let logLevel = process.env.HASURA_PLUGIN_LOG_LEVEL
    ? process.env.HASURA_PLUGIN_LOG_LEVEL
    : LogLevel.INFO;
    if ((Object.values(LogLevel) as string[]).includes(logLevel))     {
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
      this.config.outputDir = path.resolve(outputDir);
    } catch (e) {
      logger.fatal(`Cannot resolve output directory path: ${path}`);
      logger.debug(e);
      exit(1);
    }
  }

  public getOutputDirectory(): string {
    if (!this.config.outputDir) {
      logger.fatal("No output directory set");
      throw new Error("Output Directory is null");
    }
    return this.config.outputDir;
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
}
