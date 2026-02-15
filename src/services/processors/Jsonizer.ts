import { CorrelationSession } from "../../core/interface/CorrelationSession.js";
import { JsonizerConfig } from "../../core/interface/JsonzierConfig.js";
import { getOrCreateSession } from "../../core/store/CorrelationStore.js";
import { LogEntry } from "../../core/types/LogEntry.js";




export class Jsonizer {
  private readonly projectName: string;
  private readonly environment: string;
  private readonly loggerName: string;

  constructor(config: JsonizerConfig) {
    this.projectName = config.projectName;
    this.environment = config.environment;
    this.loggerName = config.loggerName;
  }

  public appendLog(
    correlationId: string,
    entry: LogEntry
  ): CorrelationSession {
    const session = getOrCreateSession(correlationId, {
      // projectName: this.projectName,
      correlationId,      
    });

    session.logs.push({
      timestamp: new Date().toISOString(),
      level: entry.level,
      message: entry.message,
      meta: entry.meta ?? {},
      loggerName: this.loggerName,
      exception:entry.exception
    });

    return session;
  }
}
