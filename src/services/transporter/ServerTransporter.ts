import { LogApi } from "../../api/LogApi.js";
import { LogPayloadType } from "../../core/enum/LogPayLoads.js";
import {
  CorrelationSession,
  NonCorrelationSession,
} from "../../core/interface/CorrelationSession.js";

type AnySession = CorrelationSession | NonCorrelationSession;

export class ServerTransporter {
  transport(session: AnySession): void {
    if (this.isFrontendSession(session)) {
      this.sendSingle(session);
      return;
    }

    this.sendCorrelation(session);
  }

  private sendCorrelation(session: CorrelationSession): void {
    LogApi({
      type: LogPayloadType.SESSION,
      data: session,
    });
  }

  private sendSingle(session: NonCorrelationSession): void {
    LogApi({
      type: LogPayloadType.SINGLE,
      data: session,
    });
  }

  private isFrontendSession(
    session: AnySession
  ): session is NonCorrelationSession {
    // Decide ONLY based on session shape/data
    return session.correlationId === "no-correlation-id";
  }
}
