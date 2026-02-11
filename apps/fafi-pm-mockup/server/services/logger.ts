/**
 * Strukturiertes Backend-Logging für FaFi PM
 * Console-basiert mit JSON-Ausgabe für einfache Weiterverarbeitung
 */

const isDev = process.env.NODE_ENV === 'development';

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  data?: Record<string, unknown>;
  error?: { name: string; message: string; stack?: string };
  duration?: number;
}

function formatEntry(entry: LogEntry): string {
  if (isDev) {
    const prefix = `[${entry.level.toUpperCase()}][${entry.module}]`;
    const extra = entry.data ? ` ${JSON.stringify(entry.data)}` : "";
    const dur = entry.duration != null ? ` (${entry.duration}ms)` : "";
    return `${prefix} ${entry.message}${extra}${dur}`;
  }
  return JSON.stringify(entry);
}

function log(level: LogLevel, module: string, message: string, extra?: Partial<LogEntry>) {
  const entry: LogEntry = { timestamp: new Date().toISOString(), level, module, message, ...extra };
  const formatted = formatEntry(entry);
  switch (level) {
    case "error": console.error(formatted); break;
    case "warn": console.warn(formatted); break;
    case "debug": if (isDev) console.debug(formatted); break;
    default: console.log(formatted);
  }
}

/**
 * Create a logger instance for a specific module
 */
export function createLogger(module: string) {
  return {
    debug: (message: string, data?: Record<string, unknown>) => log("debug", module, message, { data }),
    info: (message: string, data?: Record<string, unknown>) => log("info", module, message, { data }),
    warn: (message: string, data?: Record<string, unknown>) => log("warn", module, message, { data }),
    error: (message: string, error?: Error, data?: Record<string, unknown>) =>
      log("error", module, message, {
        data,
        error: error ? { name: error.name, message: error.message, stack: error.stack } : undefined,
      }),
    timed: (message: string, startTime: number, data?: Record<string, unknown>) =>
      log("info", module, message, { data, duration: Date.now() - startTime }),
  };
}

// Backward-compatible default logger
export const logger = {
  info: (message: string, ...args: unknown[]) => log("info", "app", message, args.length ? { data: { args } } : undefined),
  warn: (message: string, ...args: unknown[]) => log("warn", "app", message, args.length ? { data: { args } } : undefined),
  error: (message: string, ...args: unknown[]) => log("error", "app", message, args.length ? { data: { args } } : undefined),
  debug: (message: string, ...args: unknown[]) => log("debug", "app", message, args.length ? { data: { args } } : undefined),
  hubspot: (message: string, ...args: unknown[]) => log("info", "hubspot", message, args.length ? { data: { args } } : undefined),
  email: (message: string, ...args: unknown[]) => log("info", "email", message, args.length ? { data: { args } } : undefined),
};

// Pre-configured loggers for common modules
export const dbLogger = createLogger("database");
export const authLogger = createLogger("auth");
export const hubspotLogger = createLogger("hubspot");
export const emailLogger = createLogger("email");
export const taskRunnerLogger = createLogger("taskRunner");
export const ampelLogger = createLogger("ampel");
export const workflowLogger = createLogger("workflow");
export const portalLogger = createLogger("portal");

export default logger;
