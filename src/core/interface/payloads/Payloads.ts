import { LogPayloadType } from "../../enum/LogPayLoads.js";
import { CorrelationSession, NonCorrelationSession } from "../CorrelationSession.js";

export interface BackendLogPayload {
  type: LogPayloadType.SESSION;
  data: CorrelationSession;
}

export interface FrontendLogPayload {
  type: LogPayloadType.SINGLE;
  data: NonCorrelationSession;
}
