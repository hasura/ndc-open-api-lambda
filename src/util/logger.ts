import { pino } from "pino";

const logger = getLogger();

function getLogLevel(): string {
  let logLevel = process.env.HASURA_PLUGIN_LOG_LEVEL? process.env.HASURA_PLUGIN_LOG_LEVEL : 'info';
  const prettyLogs = process.env.NDC_OAS_LAMBDA_PRETTY_LOGS;

  const logLevels = new Set<string>([
    'trace',
    'debug',
    'info',
    'warn',
    'error',
    'fatal',
    'panic',
  ]);

  if (!logLevels.has(logLevel)) {
    return logLevel;
  }

  if (logLevel === 'panic') {
    return 'silent';
  }
  return logLevel;
}

function getLogger() {
  if (process.env.NDC_OAS_LAMBDA_PRETTY_LOGS && process.env.NDC_OAS_LAMBDA_PRETTY_LOGS === 'true') {
    return pino({
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          sync: true,
        }
      },
      level: getLogLevel(),
    });
  } else {
    return pino({
      level: getLogLevel(),
    });
  }
}

export function trace(...args: any[]) {
  if (args && args.length === 1) {
    logger.trace(args[0]);
  } else {
    logger.trace(args);
  }
}

export function debug(...args: any[]) {
  if (args && args.length === 1) {
    logger.debug(args[0]);
  } else {
    logger.debug(args);
  }
}

export function info(...args: any[]) {
  if (args && args.length === 1) {
    logger.info(args[0]);
  } else {
    logger.info(args);
  }
}


export function warn(...args: any[]) {
  if (args && args.length === 1) {
    logger.warn(args[0]);
  } else {
    logger.warn(args);
  }
}

export function error(...args: any[]) {
  if (args && args.length === 1) {
    logger.error(args[0]);
  } else {
    logger.error(args);
  }
}

export function fatal(...args: any[]) {
  if (args && args.length === 1) {
    logger.fatal(args[0]);
  } else {
    logger.fatal(args);
  }
}