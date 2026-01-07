import { LogLevels } from "../enum/LogLevels.js";

export interface LogEntry {
  message: string;
  meta?: Record<string, unknown>;
  timestamp: string;
  level: LogLevels;
  correlationId?: string;
  send?:boolean
}
