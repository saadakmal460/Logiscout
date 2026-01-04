import { RequestContext } from "../core/context/RequestContext.js";
import crypto from "crypto";

interface RequestLike {
  headers?: Record<string, string | string[] | undefined>;
  get?: (header: string) => string | undefined;
}

interface ResponseLike {
  setHeader?: (name: string, value: string) => void;
  locals?: Record<string, unknown>;
}

interface NextFunction {
  (err?: Error): void;
}

interface MiddlewareHandler {
  (req: RequestLike, res: ResponseLike, next: NextFunction): void;
}

export const createCorrelationMiddleware = (): MiddlewareHandler => {
  return (req: RequestLike, res: ResponseLike, next: NextFunction): void => {
    // Validate request object
    if (!req || typeof req !== "object") {
      console.error(
        "[CorrelationMiddleware] Error: Invalid request object. " +
        "Usage: createCorrelationMiddleware()(req, res, next)"
      );
      next?.(new Error("Invalid request object in correlation middleware"));
      return;
    }

    // Validate response object
    if (!res || typeof res !== "object") {
      console.error(
        "[CorrelationMiddleware] Error: Invalid response object. " +
        "Usage: createCorrelationMiddleware()(req, res, next)"
      );
      next?.(new Error("Invalid response object in correlation middleware"));
      return;
    }

    try {
      // Check for existing correlation ID in headers (case-insensitive)
      const headers = req.headers || {};
      const existingId =
        headers["x-correlation-id"] ||
        headers["X-Correlation-ID"] ||
        req.get?.("x-correlation-id") ||
        req.get?.("X-Correlation-ID");

      const correlationId =
        (typeof existingId === "string" && existingId.trim()) || crypto.randomUUID();

      // Validate correlation ID
      if (!correlationId || typeof correlationId !== "string") {
        console.error(
          "[CorrelationMiddleware] Error: Failed to generate or retrieve correlation ID"
        );
        next?.(new Error("Correlation ID generation failed"));
        return;
      }

      if (correlationId.length > 100) {
        console.warn(
          "[CorrelationMiddleware] Warning: Correlation ID exceeds 100 characters and will be truncated"
        );
      }

      // Run the remaining middleware in the request context
      RequestContext.run(
        () => {
          // Safely set the correlation ID header
          try {
            if (res.setHeader) {
              res.setHeader("x-correlation-id", correlationId);
            }
          } catch (headerError) {
            // setHeader might fail in some edge cases, don't block the request
            console.warn(
              "[CorrelationMiddleware] Warning: Could not set x-correlation-id header",
              headerError instanceof Error ? headerError.message : "Unknown error"
            );
          }

          // Store correlation ID in response locals for downstream access
          if (res.locals) {
            res.locals.correlationId = correlationId;
          }

          next?.();
        },
        correlationId
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error(
        `[CorrelationMiddleware] Error: Failed to initialize request context. ${errorMessage}`
      );
      next?.(error instanceof Error ? error : new Error("Request context initialization failed"));
    }
  };
};
