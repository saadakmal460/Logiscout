import winston, { Logger as WinstonLogger, format, transports } from "winston";
import { ConsoleFormatter } from "../../../services/formatters/ConsoleFormatter";
import { LogLevels } from "../../enum/LogLevels";

const consoleFormatter = new ConsoleFormatter();
export default function formatLogs() {
    return format.combine(
      format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      format.printf(({ timestamp, level, message, component, ...meta }) => {
        const formatted = consoleFormatter.format({
          level: level as LogLevels,
          message: String(message),
          timestamp: String(timestamp),
          component: component as string | undefined,
          ...meta,
        });
        return formatted;
      }),
    )

}
