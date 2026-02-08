import { Logger } from "../Logger/Logger.js";
import { LogLevels } from "../../core/enum/LogLevels.js";
import { LogEntry } from "../../core/types/LogEntry.js";
import { LoggerInterface } from "../../core/interface/LoggerInterface.js";
import normalizeException from "../../utils/NormalizeExceptions.js";

export class Levels extends Logger implements LoggerInterface {

  error(
    message: string,
    meta?: Record<string, unknown>,
    options?: { send?: boolean },
  ): void;

  error(
    message: string,
    meta: Record<string, unknown> | undefined,
    exception: unknown,
    options?: { send?: boolean },
  ): void;

  error(
    message: string,
    meta?: Record<string, unknown>,
    exceptionOrOptions?: unknown | { send?: boolean },
    maybeOptions?: { send?: boolean },
  ): void {
    let exception: unknown | undefined;
    let options: { send?: boolean } | undefined;

    // 3-arg call → normal error
    if (
      exceptionOrOptions &&
      typeof exceptionOrOptions === "object" &&
      "send" in (exceptionOrOptions as object)
    ) {
      options = exceptionOrOptions as { send?: boolean };
    } 
    // 4-arg call → exception error
    else {
      exception = exceptionOrOptions;
      options = maybeOptions;
    }

    const entry: LogEntry = this.getLogEntry(
      message,
      LogLevels.ERROR,
      meta,
      options,
    );

    if (exception !== undefined) {
      entry.exception = normalizeException(exception);
    }

    this.log(entry);
  }


  info(
    message: string,
    meta?: Record<string, unknown>,
    options?: { send?: boolean },
  ): void {
    const entry: LogEntry = this.getLogEntry(
      message,
      LogLevels.INFO,
      meta,
      options,
    );
    this.log(entry);
  }

  warn(
    message: string,
    meta?: Record<string, unknown>,
    options?: { send?: boolean },
  ): void {
    const entry: LogEntry = this.getLogEntry(
      message,
      LogLevels.WARN,
      meta,
      options,
    );
    this.log(entry);
  }
  debug(
    message: string,
    meta?: Record<string, unknown>,
    options?: { send?: boolean },
  ): void {
    const entry: LogEntry = this.getLogEntry(
      message,
      LogLevels.DEBUG,
      meta,
      options,
    );
    this.log(entry);
  }

  critical(
    message: string,
    meta?: Record<string, unknown>,
    options?: { send?: boolean },
  ): void {
    const entry: LogEntry = this.getLogEntry(
      message,
      LogLevels.CRITICAL,
      meta,
      options,
    );
    this.log(entry);
  }
}
