import { throwError } from "../errors/ThrowError.js";


export default function validateloggerName(loggerName:string){

    if (!loggerName || typeof loggerName !== "string") {
      throwError("Logger: logger name must be a non-empty string. " +
          "Usage: createLogger('loggerName')")
    }

    if (loggerName.length > 100) {
      throwError(
        "Logger: logger name cannot exceed 100 characters. " +
          `Received: '${loggerName.substring(0, 20)}...'`,
      );
    }
}