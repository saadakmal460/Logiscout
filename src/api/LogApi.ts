import {
  BackendLogPayload,
  FrontendLogPayload,
} from "../core/interface/payloads/Payloads.js";

import {HTTP} from "./Interceptor.js";

type LogPayload = BackendLogPayload | FrontendLogPayload;

export async function LogApi(data: LogPayload[]): Promise<void> {
  try {
    const response = await HTTP.post("/ingest", data);
  } catch (error) {
    // console.error("Failed to send log:", error);
  }
}
