import { RequestContext } from "../core/context/RequestContext.js";
import {
  endSession,
  getOrCreateSession,
  removeSession,
} from "../core/store/CorrelationStore.js";
import { getLogiScouConfig } from "../initiator/state.js";
import { RequestFormatter } from "../services/formatters/RequestFormatters.js";
import { RequestLogger } from "../services/Logger/RequestLogger.js";
import { ServerTransporter } from "../services/transporter/ServerTransporter.js";

const serverTransporter = new ServerTransporter();
const requestLogger = new RequestLogger();

export function createCorrelationMiddleware() {
  return (req: any, res: any, next: any) => {
    const correlationId =
      req.headers["x-correlation-id"] ?? crypto.randomUUID();

    const request = {
      method: req.method,
      path: req.originalUrl || req.url,
    };

    RequestContext.run(() => {
      const session = getOrCreateSession(correlationId, {
        projectName: getLogiScouConfig().projectName,
        environment: getLogiScouConfig().environment,
        correlationId,
        request: request,
      });

      res.setHeader("x-correlation-id", correlationId);

      requestLogger.start(req.method, req.originalUrl || req.url);

      res.on("finish", () => {
        session.request!.statusCode = res.statusCode;

        const payload = endSession(correlationId);

        if (!payload) return;

        requestLogger.end(
          req.method,
          req.originalUrl || req.url,
          res.statusCode,
          payload.durationMs!,
        );

        serverTransporter.transport(payload);

        removeSession(correlationId);
      });

      next();
    }, correlationId);
  };
}
