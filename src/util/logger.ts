import { Logger, pino } from "pino";
import * as context from "../app/context";

let logger: Logger<never> | undefined = undefined;

function getLogLevel(): string {
  let logLevel = context.getInstance().getLogLevel();
  if (logLevel === context.LogLevel.PANIC) {
    return "silent";
  }
  return logLevel;
}

function getLogger() {
  if (context.getInstance().isPrettyLogs()) {
    return pino({
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          sync: true,
        },
      },
      level: getLogLevel(),
    });
  } else {
    return pino({
      level: getLogLevel(),
    });
  }
}

export function resetLogger() {
  logger = getLogger();
}

export function trace(...args: any[]) {
  if (!logger) {
    logger = getLogger();
  }
  if (args && args.length === 1) {
    logger.trace(args[0]);
  } else {
    logger.trace(args);
  }
}

export function debug(...args: any[]) {
  if (!logger) {
    logger = getLogger();
  }
  if (args && args.length === 1) {
    logger.debug(args[0]);
  } else {
    logger.debug(args);
  }
}

export function info(...args: any[]) {
  if (!logger) {
    logger = getLogger();
  }
  if (args && args.length === 1) {
    logger.info(args[0]);
  } else {
    logger.info(args);
  }
}

export function warn(...args: any[]) {
  if (!logger) {
    logger = getLogger();
  }
  if (args && args.length === 1) {
    logger.warn(args[0]);
  } else {
    logger.warn(args);
  }
}

export function error(...args: any[]) {
  if (!logger) {
    logger = getLogger();
  }
  if (args && args.length === 1) {
    logger.error(args[0]);
  } else {
    logger.error(args);
  }
}

export function fatal(...args: any[]) {
  if (!logger) {
    logger = getLogger();
  }
  if (args && args.length === 1) {
    logger.fatal(args[0]);
  } else {
    logger.fatal(args);
  }
}
