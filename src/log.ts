export const LOG_LEVEL = {
  info: "info" as LOG_LEVEL_STRING,
  debug: "debug" as LOG_LEVEL_STRING,
  trace: "trace" as LOG_LEVEL_STRING,
  warn: "warn" as LOG_LEVEL_STRING,
  error: "error" as LOG_LEVEL_STRING
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

const DEFAULT_LEVEL = LOG_LEVEL_PRIORITY.warn;

let currentLogLevel: number | null = null;

export function setLogLevel(level: LOG_LEVEL_STRING) {
  if (currentLogLevel === null) {
    currentLogLevel = LOG_LEVEL_PRIORITY[level];
  } else {
    throw new Error("cannot change LOG_LEVEL at this stage!");
  }
}

export function log(level: LOG_LEVEL_STRING, text: string | any, ...args: any[]) {
  if (currentLogLevel === null) {
    currentLogLevel = DEFAULT_LEVEL;
  }
  if (currentLogLevel <= LOG_LEVEL_PRIORITY[level]) {
    console[level === "trace" ? level : "debug"](text, ...args);
  }
}
