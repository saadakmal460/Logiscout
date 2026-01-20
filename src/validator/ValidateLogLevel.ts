import { LogLevels } from "../core/enum/LogLevels";
import { throwError } from "../errors/ThrowError";

export default function validateLogLevel(logLevel: any): void {
  if (!Object.values(LogLevels).includes(logLevel)) {
    throwError(
      `Logger: Invalid log level '${logLevel}'. ` +
        `Valid levels: ${Object.values(LogLevels).join(", ")}`,
    );
  }
}
