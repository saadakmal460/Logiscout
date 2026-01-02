import { RequestContext } from "../core/context/RequestContext.js";
import crypto from "crypto";

export const createCorrelationMiddleware = () => {
  return (req: any, res: any, next: () => void) => {
    const correlationId = crypto.randomUUID();

    RequestContext.run(() => {
      if (res?.setHeader) {
        res.setHeader("x-correlation-id", correlationId);
      }
      next();
    }, correlationId);
  };
};
