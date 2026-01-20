import winston, { Logger as WinstonLogger, format, transports } from "winston";
import { LoggerInterface } from "../../core/interface/LoggerInterface.js";
import { LogEntry } from "../../core/types/LogEntry.js";
import { LogContext } from "../../core/types/LogContext.js";
import { LogApi } from "../../api/LogApi.js";
import { LogLevels } from "../../core/enum/LogLevels.js";
import { RequestContext } from "../../core/context/RequestContext.js";
import { LogiscoutConfig } from "../../initiator/state.js";
import { ConsoleFormatter } from "../formatters/ConsoleFormatter.js";
import { getOrCreateSession } from "../../core/store/CorrelationStore.js";
import {
  sendfrontendLogApi,
  sendSingleLogsApi,
  sendToLogApi,
} from "../../transporter/ServerTransporter.js";
import consoleTranspoter from "../../transporter/ConsoleTranspoter.js";
import { LOG_LEVEL_SEVERITY } from "../../core/constants/Levels/LevelsSeverity.js";
import validateComponentName from "../../validator/ValidateComponentName.js";
import { throwError } from "../../errors/ThrowError.js";
import validateLogEntry from "../../validator/ValidateLogEntry.js";
import validateLogMessage from "../../validator/ValidateLogMessage.js";
import validateLogLevel from "../../validator/ValidateLogLevel.js";

export abstract class Logger {
  protected winstonLogger: WinstonLogger;
  private componentName: string;
  private projectName: string;
  private environment: string;

  constructor(componentName: string, config: LogiscoutConfig) {
    validateComponentName(componentName);

    this.componentName = componentName;
    this.projectName = config.projectName;
    this.environment = config.environment;

    try {
      this.winstonLogger = winston.createLogger({
        level: LogLevels.DEBUG,
        levels: LOG_LEVEL_SEVERITY,
        transports: [consoleTranspoter()],
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

      const correlationId =
        RequestContext.getCorrelationId() ?? "no-correlation-id";

      let logMeta: Record<string, unknown> = {
        component: this.componentName,
        correlationId,
        ...(entry.meta ?? {}),
      };

      this.winstonLogger.log(entry.level, entry.message, logMeta);

      const session = getOrCreateSession(correlationId, {
        projectName: this.projectName,
        environment: this.environment,
        correlationId,
        component: this.componentName,
      });

      session.logs.push({
        timestamp: new Date().toISOString(),
        level: entry.level,
        message: entry.message,
        meta: logMeta,
        component: this.componentName,
      });

      const logs = {
        ...entry,
        component: this.componentName,
        projectName: this.projectName,
        correlationId,
      };

      if (correlationId == "no-correlation-id") {
        // const payload = session.endSession()
        sendSingleLogsApi(logs);
      }

      if (entry.send && this.environment == "prod") {
        // console.log("sending to he server")
        // Send structured log to API (no formatting)
        // LogApi({
        //   logs: {
        //     ...entry,
        //     component: this.componentName,
        //     correlationId,
        //   },
        // });
      } else {
        // console.log("Showed to the user")
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
      send: true,
    };
    return entry;
  }
}
