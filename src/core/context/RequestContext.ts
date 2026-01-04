import { AsyncLocalStorage } from "async_hooks";
import { randomUUID } from "crypto";

export interface RequestContextData {
  correlationId: string;
}

const storage = new AsyncLocalStorage<RequestContextData>();

export class RequestContext {
  static run(fn: () => void, correlationId?: string): void {
    // Validate function parameter
    if (typeof fn !== "function") {
      throw new Error(
        "RequestContext.run() requires a function as the first parameter. " +
        "Usage: RequestContext.run(() => { ... }, correlationId?)"
      );
    }

    // Validate correlationId if provided
    if (correlationId !== undefined && typeof correlationId !== "string") {
      throw new Error(
        "RequestContext.run(): correlationId must be a string if provided. " +
        `Received: ${typeof correlationId}`
      );
    }

    if (correlationId && correlationId.length > 100) {
      throw new Error(
        "RequestContext.run(): correlationId cannot exceed 100 characters."
      );
    }

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
      throw new Error(
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
