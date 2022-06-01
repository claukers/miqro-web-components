export const LOG_LEVEL: {
  [key: string]: LOG_LEVEL_STRING;
} = {
  info: "info",
  debug: "debug",
  trace: "trace",
  warn: "warn",
  error: "error"
};

export type LOG_LEVEL_STRING = "info" | "debug" | "trace" | "warn" | "error";

const LOG_LEVEL_PRIORITY = {
  trace: 0,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
  none: 5
};

let currentLogLevel = LOG_LEVEL_PRIORITY.warn;

export function setLogLevel(level = "info") {

}

export function log(level: LOG_LEVEL_STRING, text: string | any, ...args: any[]) {
  if (currentLogLevel <= LOG_LEVEL_PRIORITY[level]) {
    console[level](text, ...args);
  }
}
