import { AsyncLocalStorage } from "async_hooks";
import { randomUUID } from "crypto";
import { throwError } from "../../errors/ThrowError.js";
import { validateRequestContext } from "../../validator/ValidateRequestContext.js";
import { RequestContextData } from "../interface/RequestContext.js";



const storage = new AsyncLocalStorage<RequestContextData>();

export class RequestContext {
  static run(fn: () => void, correlationId?: string): void {

    validateRequestContext(fn , correlationId)

    // Generate UUID if not provided
    const id = correlationId ?? randomUUID();

    try {
      storage.run(
        {
          correlationId: id,
        },
        fn
      );
    } catch (error) {
      throwError(
        `RequestContext.run(): Failed to run function in context. ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  static getCorrelationId(): string | undefined {
    try {
      const store = storage.getStore();
      return store?.correlationId;
    } catch (error) {
      // AsyncLocalStorage access failed - likely outside async context
      console.warn(
        "[RequestContext] Warning: Could not retrieve correlationId. " +
        "This may occur outside of a RequestContext.run() block. " +
        "Consider using createCorrelationMiddleware() for HTTP requests."
      );
      return undefined;
    }
  }
}
