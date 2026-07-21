import { PostgrestError } from "@supabase/supabase-js";

type LogLevel = "debug" | "info" | "warn" | "error";

type LogMeta = Record<string, unknown>;

const formatError = (error: unknown) => {
  if (!error || typeof error !== "object") return error;

  const err = error as {
    name?: string;
    message?: string;
    stack?: string;
    code?: string;
    details?: string;
    hint?: string;
    status?: number;
  };

  return {
    name: err.name,
    message: err.message,
    code: err.code,
    details: err.details,
    hint: err.hint,
    status: err.status,
    stack: err.stack,
  };
};

function log(level: LogLevel, message: string, meta: LogMeta = {}) {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  };

  const writer = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
  writer(JSON.stringify(payload));
}

export const logger = {
  debug: (message: string, meta?: LogMeta) => log("debug", message, meta),
  info: (message: string, meta?: LogMeta) => log("info", message, meta),
  warn: (message: string, _historyError: PostgrestError, meta?: LogMeta) => log("warn", message, meta),
  error: (message: string, error?: unknown, meta: LogMeta = {}) =>
    log("error", message, { ...meta, error: formatError(error) }),
};
