import winston, { Logger as WinstonLogger, exceptions, format, transports } from "winston";
import { LogEntry } from "../../core/types/LogEntry.js";
import { LogLevels } from "../../core/enum/LogLevels.js";
import { RequestContext } from "../../core/context/RequestContext.js";
import { LogiscoutConfig } from "../../initiator/state.js";
import { ConsoleTransporter } from "../transporter/ConsoleTranspoter.js";
import { LOG_LEVEL_SEVERITY } from "../../core/constants/Levels/LevelsSeverity.js";
import validateloggerName from "../../validator/ValidateLoggerName.js";
import { throwError } from "../../errors/ThrowError.js";
import validateLogEntry from "../../validator/ValidateLogEntry.js";
import validateLogMessage from "../../validator/ValidateLogMessage.js";
import validateLogLevel from "../../validator/ValidateLogLevel.js";
import { Jsonizer } from "../processors/Jsonizer.js";
import { serverTransporter } from "../transporter/ServerTransporter.js";

export abstract class Logger {
  protected winstonLogger: WinstonLogger;
  private loggerName: string;
  private projectName: string;
  private environment: string;
  private readonly jsonizer: Jsonizer;
  private readonly consoleTransporter:ConsoleTransporter

  constructor(loggerName: string, config: LogiscoutConfig) {
    validateloggerName(loggerName);

    this.loggerName = loggerName;
    this.projectName = config.projectName;
    this.environment = config.environment;
    this.jsonizer = new Jsonizer({
      projectName: this.projectName,
      environment: this.environment,
      loggerName: this.loggerName,
    });
    // this.serverTransporter = new ServerTransporter()
    this.consoleTransporter = new ConsoleTransporter()

    try {
      this.winstonLogger = winston.createLogger({
        level: LogLevels.DEBUG,
        levels: LOG_LEVEL_SEVERITY,
        transports: [this.consoleTransporter.transport()],
      });
    } catch (error) {
      throwError(
        `Logger: Failed to initialize Winston logger. ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }

  protected log(entry: LogEntry): void {
    try {
      // Validate log entry
      validateLogEntry(entry);

      const correlationId = RequestContext.getCorrelationId() ?? "no-correlation-id";

      let logMeta: Record<string, unknown> = {
        logger: this.loggerName,
        correlationId,
        ...(entry.meta ?? {}),
        exception: entry.exception
      };

      let consoleMeta: Record<string, unknown> = {
        logger: this.loggerName,
        ...(entry.meta ?? {}),
        exception: entry.exception
      };

      this.winstonLogger.log(entry.level, entry.message, consoleMeta);

      this.jsonizer.appendLog(correlationId, {
        timestamp: new Date().toISOString(),
        level: entry.level,
        message: entry.message,
        meta: logMeta,
        exception:entry.exception
      });

      const logs = {
        ...entry,
        projectName: this.projectName,
        loggerName: this.loggerName,
        correlationId,
        exception:entry.exception
      };

      if (entry.send && this.environment == "prod" && correlationId=="no-correlation-id") {
        // console.log("sending to he server")
        serverTransporter.transport(logs);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
        console.error(
          `[Logiscout] Critical: Logger failed to write log: ${errorMessage}`,
        );
    }
  }

  getWinstonLogger(): WinstonLogger {
    return this.winstonLogger;
  }

  protected getLogEntry(
    message: string,
    logLevel: LogLevels,
    meta?: Record<string, unknown>,
    options?: { send?: boolean }
  ): LogEntry {
    // Validate message
    validateLogMessage(message)

    // Validate log level
    validateLogLevel(logLevel)

    const entry: LogEntry = {
      message,
      meta,
      timestamp: new Date().toISOString(),
      level: logLevel,
      send:options?.send ?? true,
    };
    return entry;
  }
}
