import { throwError } from "../errors/ThrowError.js";

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
