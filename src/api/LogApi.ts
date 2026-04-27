import {
  BackendLogPayload,
  FrontendLogPayload,
} from "../core/interface/payloads/Payloads.js";
import { getLogiScouConfig } from "../initiator/state.js";
import { HTTP } from "./Interceptor.js";

type LogPayload = BackendLogPayload | FrontendLogPayload;

export async function LogApi(data: LogPayload[]): Promise<void> {
  try {
    const { apiKey } = getLogiScouConfig();
    await HTTP.post("/ingest", data, {
      headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : undefined,
    });
  } catch (error) {
    console.error("Failed to send log:", error);
  }
}
