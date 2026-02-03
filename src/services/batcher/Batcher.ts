import { LogApi } from "../../api/LogApi.js";
import { LogPayloadType } from "../../core/enum/LogPayLoads.js";
import {
  CorrelationSession,
  NonCorrelationSession,
} from "../../core/interface/CorrelationSession.js";
import { BackendLogPayload, FrontendLogPayload } from "../../core/interface/payloads/Payloads.js";

type AnySession = CorrelationSession | NonCorrelationSession;
type LogPayload = BackendLogPayload | FrontendLogPayload;
function isCorrelationSession(
  session: AnySession
): session is CorrelationSession {
  return Array.isArray((session as CorrelationSession).logs);
}


export class LogBatcher {
  private buffer: LogPayload[] = [];
  private readonly MAX_BATCH_SIZE = 50;
  private readonly FLUSH_INTERVAL = 30000;
  private timer: NodeJS.Timeout;

  constructor() {
    this.timer = setInterval(() => {
      this.flush();
    }, this.FLUSH_INTERVAL);
  }

  add(payload:LogPayload) {

     const { type, data } = payload;

    // ✅ drop empty favicon sessions
    if (
      type === LogPayloadType.SESSION &&
      isCorrelationSession(data) &&
      data.request?.path === "/favicon.ico" &&
      data.logs.length === 0
    ) {
      return;
    }

    this.buffer.push(payload);

    if (this.buffer.length >= this.MAX_BATCH_SIZE) {
      this.flush();
    }
  }

  private flush() {
    if (this.buffer.length === 0) return;

    const batch = [...this.buffer];
    this.buffer.length = 0;
    LogApi(batch);
  }
}
