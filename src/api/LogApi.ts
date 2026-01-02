import HTTP from "./Interceptor.js";

interface LogPayload {
  logs: unknown;
}

export async function LogApi(data: LogPayload): Promise<void> {
  try {
    const response = await HTTP.post("/log", data);
    console.log("Log sent successfully:", response.status);
  } catch (error) {
    console.error("Failed to send log:", error);
  }
}
