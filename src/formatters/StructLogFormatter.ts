import { LogLevels } from "../core/enum/LogLevels.js";

/**
 * Log level colors for terminal output (ANSI escape codes)
 */
const LOG_LEVEL_COLORS: Record<LogLevels | string, string> = {
  [LogLevels.DEBUG]: "\x1b[90m",   // Gray/Bright Black
  [LogLevels.INFO]: "\x1b[32m",    // Green
  [LogLevels.WARN]: "\x1b[33m",    // Yellow
  [LogLevels.ERROR]: "\x1b[31m",   // Red
  [LogLevels.CRITICAL]: "\x1b[35m", // Magenta
};

/**
 * Unicode symbols for each log level
 */
const LOG_LEVEL_SYMBOLS: Record<LogLevels | string, string> = {
  [LogLevels.DEBUG]: "🔍",
  [LogLevels.INFO]: "✓",
  [LogLevels.WARN]: "⚠",
  [LogLevels.ERROR]: "✗",
  [LogLevels.CRITICAL]: "☠",
};

/**
 * Reset ANSI code
 */
const RESET = "\x1b[0m";

/**
 * Bright/Bold ANSI code for emphasis
 */
const BOLD = "\x1b[1m";

/**
 * Formats a value for display in logs
 * Handles objects, arrays, strings, and special values
 */
function formatValue(value: unknown, indent: number = 0): string {
  const spaces = "  ".repeat(indent);

  if (value === null) {
    return "null";
  }

  if (value === undefined) {
    return "undefined";
  }

  if (typeof value === "string") {
    // Check if it's a JSON string that should be parsed
    if (value.startsWith("{") || value.startsWith("[")) {
      try {
        const parsed = JSON.parse(value);
        return formatValue(parsed, indent);
      } catch {
        // Not valid JSON, return as is
        return `"${value}"`;
      }
    }
    return `"${value}"`;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return "[]";
    }

    const items = value.map((item) => {
      const formatted = formatValue(item, indent + 1);
      return `${spaces}  ${formatted}`;
    }).join(",\n");

    return `[\n${items}\n${spaces}]`;
  }

  if (typeof value === "object") {
    const keys = Object.keys(value as Record<string, unknown>);
    if (keys.length === 0) {
      return "{}";
    }

    const entries = keys.map((key) => {
      const formattedKey = `\x1b[36m"${key}"\x1b[0m`; // Cyan for keys
      const formattedValue = formatValue((value as Record<string, unknown>)[key], indent + 1);
      return `${spaces}  ${formattedKey}: ${formattedValue}`;
    }).join(",\n");

    return `{\n${entries}\n${spaces}}`;
  }

  return String(value);
}

/**
 * Safe stringify with fallback for circular references
 */
function safeStringify(obj: Record<string, unknown>): string {
  const seen = new Set<object>();

  return JSON.stringify(obj, (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return "[Circular]";
      }
      seen.add(value);
    }
    return value;
  }, 2);
}

/**
 * Interface for log event data
 */
export interface LogEventData {
  level: LogLevels;
  message: string;
  timestamp: string;
  component?: string;
  correlationId?: string;
  [key: string]: unknown;
}

/**
 * StructLog-style formatter for beautiful terminal log output
 *
 * Produces output like:
 * [2024-01-15 14:30:45]          INFO     [component] message
 *                                                    key1=value1
 *                                                    key2=value2
 *
 * Or more verbose structlog style:
 * 2024-01-15T14:30:45.123Z
 * event                   = "Your message here"
 * level                   = "info"
 * component               = "MyService"
 * key                     = "value"
 */
export class StructLogFormatter {
  /**
   * Format a log event for console output
   */
  format(data: LogEventData): string {
    const { level, message, timestamp, component, correlationId, ...meta } = data;

    // Get color and symbol for the level
    const color = LOG_LEVEL_COLORS[level] || LOG_LEVEL_COLORS[LogLevels.INFO];
    const symbol = LOG_LEVEL_SYMBOLS[level] || LOG_LEVEL_SYMBOLS[LogLevels.INFO];
    const levelStr = level.toUpperCase().padEnd(7, " ");

    // Build the main log line
    const formattedTimestamp = this.formatTimestamp(timestamp);
    const formattedComponent = component ? `[${component}]` : "";
    const formattedCorrelationId = correlationId
      ? `\x1b[90m(${correlationId})\x1b[0m`
      : "";

    // Build main line with colors
    const mainLine = [
      `${BOLD}${formattedTimestamp}${RESET}`,
      `${color}${symbol} ${levelStr}${RESET}`,
      `${BOLD}${formattedComponent}${RESET}`,
      `${BOLD}${message}${RESET}`,
      formattedCorrelationId,
    ]
      .filter(Boolean)
      .join("  ");

    // Format metadata
    const metaOutput = this.formatMetadata(meta);

    return metaOutput ? `${mainLine}\n${metaOutput}` : mainLine;
  }

  /**
   * Format timestamp to a readable format
   */
  private formatTimestamp(timestamp: string): string {
    try {
      const date = new Date(timestamp);

      // Check if it's ISO format with milliseconds
      if (timestamp.includes("T")) {
        return date.toISOString().replace("T", " ").replace("Z", "");
      }

      // Check if already formatted
      if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(timestamp)) {
        return timestamp;
      }

      return date.toISOString().replace("T", " ").replace("Z", "");
    } catch {
      return timestamp;
    }
  }

  /**
   * Format metadata as key-value pairs
   */
  private formatMetadata(meta: Record<string, unknown>): string {
    const keys = Object.keys(meta);

    if (keys.length === 0) {
      return "";
    }

    // Filter out internal keys that shouldn't be shown
    const filteredKeys = keys.filter(
      (key) => !key.startsWith("_") && !key.includes("internal")
    );

    if (filteredKeys.length === 0) {
      return "";
    }

    const maxKeyLength = Math.max(
      ...filteredKeys.map((k) => k.length)
    );

    const lines = filteredKeys.map((key) => {
      const paddedKey = key.padEnd(maxKeyLength, " ");
      const value = formatValue(meta[key]);
      return `  ${paddedKey}  =  ${value}`;
    });

    return lines.join("\n");
  }

  /**
   * Format log event as a single compact line (no newlines)
   */
  formatCompact(data: LogEventData): string {
    const { level, message, timestamp, component, ...meta } = data;

    const color = LOG_LEVEL_COLORS[level] || LOG_LEVEL_COLORS[LogLevels.INFO];
    const symbol = LOG_LEVEL_SYMBOLS[level] || LOG_LEVEL_SYMBOLS[LogLevels.INFO];

    const base = `[${timestamp}] ${symbol} ${level.toUpperCase()}`;
    const metaStr = Object.keys(meta).length > 0 ? ` ${safeStringify(meta)}` : "";

    return `${color}${base}${RESET} [${component}] ${message}${metaStr}`;
  }

  /**
   * Format log event with full structlog style (key=value pairs)
   */
  formatVerbose(data: LogEventData): string {
    const lines: string[] = [];

    // Timestamp on first line
    lines.push(this.formatTimestamp(data.timestamp));

    // Main event info
    lines.push(`${BOLD}event${RESET} = "${data.message}"`);
    lines.push(`${BOLD}level${RESET} = "${data.level}"`);

    // Add component if present
    if (data.component) {
      lines.push(`${BOLD}component${RESET} = "${data.component}"`);
    }

    // Add correlation ID if present
    if (data.correlationId) {
      lines.push(`${BOLD}correlation_id${RESET} = "${data.correlationId}"`);
    }

    // Add all metadata as key=value pairs
    const { level, message, timestamp, component, correlationId, ...meta } = data;

    Object.entries(meta).forEach(([key, value]) => {
      if (!key.startsWith("_")) {
        lines.push(`${BOLD}${key}${RESET} = ${formatValue(value)}`);
      }
    });

    return lines.join("\n");
  }

  /**
   * Get the color code for a log level
   */
  static getLevelColor(level: LogLevels | string): string {
    return LOG_LEVEL_COLORS[level] || LOG_LEVEL_COLORS[LogLevels.INFO];
  }

  /**
   * Get the symbol for a log level
   */
  static getLevelSymbol(level: LogLevels | string): string {
    return LOG_LEVEL_SYMBOLS[level] || LOG_LEVEL_SYMBOLS[LogLevels.INFO];
  }

  /**
   * Reset code for ANSI
   */
  static RESET = RESET;
}

/**
 * Format a log entry for display (legacy function for backward compatibility)
 */
export function formatLogEntry(
  level: LogLevels,
  message: string,
  timestamp: string,
  component?: string,
  meta?: Record<string, unknown>
): string {
  const formatter = new StructLogFormatter();
  return formatter.format({
    level,
    message,
    timestamp,
    component,
    ...meta,
  });
}
