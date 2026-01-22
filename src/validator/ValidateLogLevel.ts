import { LogLevels } from "../core/enum/LogLevels.js";
import { throwError } from "../errors/ThrowError.js";

export default function validateLogLevel(logLevel: any): void {
  if (!Object.values(LogLevels).includes(logLevel)) {
    throwError(
      `Logger: Invalid log level '${logLevel}'. ` +
        `Valid levels: ${Object.values(LogLevels).join(", ")}`,
    );
  }
}
