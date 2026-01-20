import { LogEntry } from "../core/types/LogEntry";
import { throwError } from "../errors/ThrowError";

export default function validateLogMessage(message: string): void {
  if (!message || typeof message !== "string") {
      throwError(
        `Logger: Message must be a non-empty string. ` +
          `Received: ${
            typeof message === "undefined" ? "undefined" : typeof message
          }`,
      );
    }
}
