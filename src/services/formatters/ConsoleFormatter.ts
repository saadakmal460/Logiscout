import { LEVEL_COLORS } from "../../core/constants/Levels/LevelsColors.js";
import { LogLevels } from "../../core/enum/LogLevels.js";

const RESET = "\x1b[0m";
export class ConsoleFormatter {
  format(data: {
    level: LogLevels;
    message: string;
    timestamp: string;
    component?: string;
    meta?: Record<string, unknown>;
    exception?: unknown;
  }): string {
    const { level, message, timestamp, component, meta, exception } = data;

    const color = LEVEL_COLORS[level] ?? "";
    const levelLabel = `${color}${level.toUpperCase()}${RESET}`;
    const componentLabel = component ?? "App";

    let output =
      `${timestamp} ` +
      `[${levelLabel}] ` +
      `[${componentLabel}] ` +
      `${message}\n`;

    if (meta && Object.keys(meta).length > 0) {
      output += `\n${this.prettyJson(meta)}`;
    }

    if (exception) {
      output += `\nException:\n${this.prettyJson(
        typeof exception === "object"
          ? (exception as Record<string, unknown>)
          : { value: exception },
      )}`;
    }

    return output;
  }

  private prettyJson(obj: Record<string, unknown>): string {
    try {
      return JSON.stringify(obj, null, 2);
    } catch {
      return '{ "error": "Failed to serialize metadata" }';
    }
  }
}
