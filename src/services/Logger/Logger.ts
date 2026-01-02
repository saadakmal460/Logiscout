import winston, { Logger as WinstonLogger, format, transports } from "winston";
import { LoggerInterface } from "../../core/interface/LoggerInterface.js";
import { LogEntry } from "../../core/types/LogEntry.js";
import { LogContext } from "../../core/types/LogContext.js";
import { LogApi } from "../../api/LogApi.js";
import { LogLevels } from "../../core/enum/LogLevels.js";
import { RequestContext } from "../../core/context/RequestContext.js";

export abstract class Logger {
  protected winstonLogger: WinstonLogger;
  private componentName: string;
  

  constructor(componentName: string) {
    this.componentName = componentName;
    this.winstonLogger = winston.createLogger({
      level: "debug",
      levels: {
        error: 0,
        warn: 1,
        info: 2,
        debug: 3,
      },
      format: format.combine(
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.printf(
          ({
            timestamp,
            level,
            message,
            component,
            correlationId,
            ...meta
          }) => {
            const metaString =
              Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : "";

            return `[${component}] [${timestamp}] [${level.toUpperCase()}] [${correlationId}] ${message}${metaString}`;
          }
        )
      ),
      transports: [
        new transports.Console({
          format: format.combine(
            format.colorize({ all: true }),
            format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
            format.printf(({ timestamp, level, message, ...meta }) => {
              const metaString =
                Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : "";
              return `[${componentName}] [${timestamp}] [${level}] ${message}${metaString}`;
            })
          ),
        }),
      ],
    });
  }

  protected log(entry: LogEntry): void {
    try {
      const correlationId = RequestContext.getCorrelationId();

      const logMeta = {
        component: this.componentName,
        correlationId,
        ...entry.meta,
      };

      this.winstonLogger.log(entry.level, entry.message, logMeta);

      // Send structured log to API (no formatting)
      // LogApi({
      //   logs: {
      //     ...entry,
      //     component: this.componentName,
      //     correlationId,
      //   },
      // });
    } catch {
      // never throw from logger
    }
  }

  getWinstonLogger(): WinstonLogger {
    return this.winstonLogger;
  }

  protected getLogEntry(
    message: string,
    logLevel: LogLevels,
    meta?: Record<string, unknown>
  ): LogEntry {
    const entry: LogEntry = {
      message,
      meta,
      timestamp: new Date().toISOString(),
      level: logLevel,
    };
    return entry;
  }
}
