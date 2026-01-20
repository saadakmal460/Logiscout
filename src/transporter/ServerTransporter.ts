import { LogApi } from "../api/LogApi.js";
import { LogPayloadType } from "../core/enum/LogPayLoads.js";
import { CorrelationSession, forntendSession } from "../core/interface/CorrelationSession.js";

export function sendToLogApi(payload: CorrelationSession) {
  LogApi({
    type: LogPayloadType.SESSION,
    data: payload,
  });
}

export function sendSingleLogsApi(payload: forntendSession) {
  LogApi({
    type: LogPayloadType.SINGLE,
    data: payload,
  });
}

