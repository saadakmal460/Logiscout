import {
  BackendLogPayload,
  FrontendLogPayload,
} from "../core/interface/payloads/Payloads.js";


import HTTP from "./Interceptor.js";

type LogPayload = BackendLogPayload | FrontendLogPayload;
export async function LogApi(data: LogPayload): Promise<void> {
  try {
    console.log(data);
    // const response = await HTTP.post("/log", data);
  } catch (error) {
    console.error("Failed to send log:", error);
  }
}
