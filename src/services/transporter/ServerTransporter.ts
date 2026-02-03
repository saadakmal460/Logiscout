import { LogPayloadType } from "../../core/enum/LogPayLoads.js";
import {
  CorrelationSession,
  NonCorrelationSession,
} from "../../core/interface/CorrelationSession.js";
import { LogBatcher } from "../batcher/Batcher.js";

type AnySession = CorrelationSession | NonCorrelationSession;

export class ServerTransporter {
  private batcher = new LogBatcher();

  transport(session: AnySession): void {

    if (this.isFrontendSession(session)) {
      this.batcher.add({
        type: LogPayloadType.SINGLE,
        data: session,
      });
    } else {
      this.batcher.add({
        type: LogPayloadType.SESSION,
        data: session,
      });
    }
  }

  private isFrontendSession(
    session: AnySession,
  ): session is NonCorrelationSession {
    return session.correlationId === "no-correlation-id";
  }
}
