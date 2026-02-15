import { LogLevels } from "../enum/LogLevels.js";

export interface CorrelationSession {
  correlationId: string;

  startedAt: string;
  endedAt?: string;
  durationMs?: number;

  request?: {
    method?: string;
    path?: string;
    statusCode?: number;
  };

  logs: Array<{
    timestamp: string;
    level: LogLevels;
    message: string;
    meta?: Record<string, unknown>;
    loggerName: string;
    exception:unknown
  }>;
}

export interface NonCorrelationSession {
  timestamp: string;
  level: LogLevels;
  message: string;
  meta?: Record<string, unknown>;
  loggerName: string;
  correlationId?:string
  exception:unknown
}
