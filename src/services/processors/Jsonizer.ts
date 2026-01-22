import { CorrelationSession } from "../../core/interface/CorrelationSession.js";
import { JsonizerConfig } from "../../core/interface/JsonzierConfig.js";
import { getOrCreateSession } from "../../core/store/CorrelationStore.js";
import { LogEntry } from "../../core/types/LogEntry.js";




export class Jsonizer {
  private readonly projectName: string;
  private readonly environment: string;
  private readonly componentName: string;

  constructor(config: JsonizerConfig) {
    this.projectName = config.projectName;
    this.environment = config.environment;
    this.componentName = config.componentName;
  }

  public appendLog(
    correlationId: string,
    entry: LogEntry
  ): CorrelationSession {
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
      meta: entry.meta ?? {},
      component: this.componentName,
    });

    return session;
  }
}
