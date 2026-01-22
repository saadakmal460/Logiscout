import { throwError } from "../errors/ThrowError.js";

export function validateRequestContext(
  fn: () => void,
  correlationId: string|undefined,
): void {
  if (typeof fn !== "function") {
    throwError(
      "RequestContext.run() requires a function as the first parameter. " +
        "Usage: RequestContext.run(() => { ... }, correlationId?)",
    );
  }

  // Validate correlationId if provided
  if (correlationId !== undefined && typeof correlationId !== "string") {
    throwError(
      "RequestContext.run(): correlationId must be a string if provided. " +
        `Received: ${typeof correlationId}`,
    );
  }

  if (correlationId && correlationId.length > 100) {
    throwError(
      "RequestContext.run(): correlationId cannot exceed 100 characters.",
    );
  }
}
