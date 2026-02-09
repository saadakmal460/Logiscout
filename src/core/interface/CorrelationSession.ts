import { LogLevels } from "../enum/LogLevels.js";

export interface CorrelationSession {
  projectName: string;
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
    component: string;
    exception:unknown
  }>;
}

export interface NonCorrelationSession {
  projectName: string;
  timestamp: string;
  level: LogLevels;
  message: string;
  meta?: Record<string, unknown>;
  component: string;
  correlationId?:string
  exception:unknown
}
