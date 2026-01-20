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
  }): string {
    const { level, message, timestamp, component, meta } = data;

    const color = LEVEL_COLORS[level] ?? "";
    const levelLabel = `${color}${level.toUpperCase()}${RESET}`;
    const componentLabel = component ?? "App";

    let output =
      `${timestamp} ` +
      `[${levelLabel}] ` +
      `[${componentLabel}] ` +
      `${message}`;

    if (meta && Object.keys(meta).length > 0) {
      output += `\n${this.prettyJson(meta)}`;
    }

    return output;
  }

  private prettyJson(obj: Record<string, unknown>): string {
    try {
      return JSON.stringify(obj, null, 2);
    } catch {
      return "{ \"error\": \"Failed to serialize metadata\" }";
    }
  }
}
