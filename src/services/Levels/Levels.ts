import { Logger } from "../Logger/Logger.js";
import { LogLevels } from "../../core/enum/LogLevels.js";
import { LogEntry } from "../../core/types/LogEntry.js";
import { LoggerInterface } from "../../core/interface/LoggerInterface.js";

export class Levels extends Logger implements LoggerInterface{
  info(message: string, meta?: Record<string, unknown> , options?: { send?: boolean }): void {
    const entry:LogEntry = this.getLogEntry(message , LogLevels.INFO , meta , options)
    this.log(entry);
  }

  warn(message: string, meta?: Record<string, unknown> ,options?: { send?: boolean }): void {
    const entry:LogEntry = this.getLogEntry(message , LogLevels.WARN , meta , options)
    this.log(entry);
  }

  error(message: string, meta?: Record<string, unknown> ,options?: { send?: boolean }): void {
    const entry:LogEntry = this.getLogEntry(message , LogLevels.ERROR , meta , options)
    this.log(entry);
  }

  debug(message: string, meta?: Record<string, unknown> , options?: { send?: boolean }): void {
    const entry:LogEntry = this.getLogEntry(message , LogLevels.DEBUG , meta , options)
    this.log(entry);
  }

  critical(message: string, meta?: Record<string, unknown> , options?: { send?: boolean }): void {
    const entry:LogEntry = this.getLogEntry(message , LogLevels.CRITICAL , meta , options)
    this.log(entry);
  }

}
