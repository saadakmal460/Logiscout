import { LogPayloadType } from "../../enum/LogPayLoads";
import { CorrelationSession, forntendSession } from "../CorrelationSession";

export interface BackendLogPayload {
  type: LogPayloadType.SESSION;
  data: CorrelationSession;
}

export interface FrontendLogPayload {
  type: LogPayloadType.SINGLE;
  data: forntendSession;
}
