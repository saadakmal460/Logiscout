import winston, { Logger as WinstonLogger, format, transports } from "winston";
import { LoggerInterface } from "../../core/interface/LoggerInterface.js";
import { LogEntry } from "../../core/types/LogEntry.js";
import { LogContext } from "../../core/types/LogContext.js";
import { LogApi } from "../../api/LogApi.js";
import { LogLevels } from "../../core/enum/LogLevels.js";
import { RequestContext } from "../../core/context/RequestContext.js";
import { LogiscoutConfig } from "../../initiator/state.js";
import { ConsoleFormatter } from "../formatters/ConsoleFormatter.js";


export abstract class Logger {
  protected winstonLogger: WinstonLogger;
  private componentName: string;
  private projectName:string;
  private environment:string;

  constructor(componentName: string , config:LogiscoutConfig) {
    // Validate component name
    if (!componentName || typeof componentName !== "string") {
      throw new Error(
        "Logger: Component name must be a non-empty string. " +
        "Usage: createLogger('ComponentName')"
      );
    }

    if (componentName.length > 100) {
      throw new Error(
        "Logger: Component name cannot exceed 100 characters. " +
        `Received: '${componentName.substring(0, 20)}...'`
      );
    }

    this.componentName = componentName;
    this.projectName = config.projectName;
    this.environment = config.environment

    try {
      // Create structlog-style formatter instance
      const consoleFormatter = new ConsoleFormatter();

      this.winstonLogger = winston.createLogger({
        level: "debug",
        levels: {
          error: 0,
          warn: 1,
          info: 2,
          debug: 3,
        },
        // File transport format (non-colorized)
        format: format.combine(
          format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
          format.printf(({ timestamp, level, message, component, ...meta }) => {
            const formatted = consoleFormatter.format({
              level: level as LogLevels,
              message: String(message),
              timestamp: String(timestamp),
              component: component as string | undefined,
              ...meta,
            });
            return `[${config.projectName}] ${formatted}`;
          })
        ),
        transports: [
          new transports.Console({
            // Console transport with structlog-style formatting and colors
            format: format.combine(
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
              })
            ),
          }),
        ],
      });
    } catch (error) {
      throw new Error(
        `Logger: Failed to initialize Winston logger. ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  protected log(entry: LogEntry): void {
    try {
      // Validate log entry
      if (!entry) {
        console.error("[Logiscout] Error: Log entry is undefined or null");
        return;
      }

      if (!entry.message || typeof entry.message !== "string") {
        console.error(
          "[Logiscout] Error: Log message must be a non-empty string. " +
          `Usage: logiscout.${entry.level}('Your message', { meta })`
        );
        return;
      }

      if (entry.message.length > 10000) {
        console.error(
          "[Logiscout] Error: Log message exceeds 10000 characters. " +
          "Message truncated for logging."
        );
        entry.message = entry.message.substring(0, 10000) + "... [truncated]";
      }

      const correlationId = RequestContext.getCorrelationId() ?? "no-correlation-id";

      // Safely handle metadata - prevent circular reference issues
      let logMeta: Record<string, unknown>;
      try {
        logMeta = {
          component: this.componentName,
          correlationId,
          ...entry.meta,
        };

      } catch (metaError) {
        console.error(
          "[Logiscout] Error: Failed to process metadata. Logging without metadata.",
          metaError instanceof Error ? metaError.message : "Unknown error"
        );
        logMeta = {
          component: this.componentName,
          correlationId,
          _metaError: "Failed to process metadata",
        };
      }

      this.winstonLogger.log(entry.level, entry.message, logMeta);
      if(entry.send && this.environment == "prod"){
        // console.log("sending to he server")
        // Send structured log to API (no formatting)
        // LogApi({
        //   logs: {
        //     ...entry,
        //     component: this.componentName,
        //     correlationId,
        //   },
        // });
      }else{
        // console.log("Showed to the user")
      }
      
    } catch (error) {
      // Silent failure - logger should never crash the application
      // Log to console as last resort
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error(`[Logiscout] Critical: Logger failed to write log: ${errorMessage}`);
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
    // Validate message
    if (!message || typeof message !== "string") {
      throw new Error(
        `Logger: Message must be a non-empty string. ` +
        `Received: ${typeof message === "undefined" ? "undefined" : typeof message}`
      );
    }

    // Validate log level
    if (!Object.values(LogLevels).includes(logLevel)) {
      throw new Error(
        `Logger: Invalid log level '${logLevel}'. ` +
        `Valid levels: ${Object.values(LogLevels).join(", ")}`
      );
    }

    const entry: LogEntry = {
      message,
      meta,
      timestamp: new Date().toISOString(),
      level: logLevel,
      send:true
    };
    return entry;
  }
}
