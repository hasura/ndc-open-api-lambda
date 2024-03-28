/**
 * This file contains a list of Env Vars that the CLI reads for its configuration, alongwith their documentation
 */

/**
 * The directory where the configuration files for this connector will be mounted
 */
export const CONFIGURATION_DIRECTORY = "HASURA_CONFIGURATION_DIRECTORY";
export const CONFIGURATION_DIRECTORY_DEFAULT_VALUE = "/etc/connector/";

/**
 * The port on which the connector will run
 */
export const CONNECTOR_PORT = "HASURA_CONNECTOR_PORT";
export const CONNECTOR_PORT_DEFAULT_VALUE = "8080";

/**
 * Log specifc env vars
 */
export const LOG_LEVEL = "HASURA_PLUGIN_LOG_LEVEL";