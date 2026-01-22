import { LogEntry } from "../core/types/LogEntry.js";
import { throwError } from "../errors/ThrowError.js";

export default function validateLogEntry(entry: LogEntry): void {
  if (!entry) {
    throwError("[Logiscout] Log entry is undefined or null");
  }

  if (!entry.message || typeof entry.message !== "string") {
    throwError(
      "[Logiscout] Log message must be a non-empty string. " +
        `Usage: logiscout.${entry.level}('Your message', { meta })`
    );
  }

  if (entry.message.length > 10000) {
    console.error(
      "[Logiscout] Log message exceeds 10000 characters. Message truncated."
    );

    entry.message =
      entry.message.substring(0, 10000) + "... [truncated]";
  }
}
