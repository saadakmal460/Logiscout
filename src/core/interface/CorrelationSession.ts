import { LogLevels } from "../enum/LogLevels.js";

export interface CorrelationSession {
  projectName: string;
  environment: string;
  correlationId: string;
  component?: string;

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
}
