import { RequestContext } from "../core/context/RequestContext.js";
import {
  endSession,
  getOrCreateSession,
  removeSession,
} from "../core/store/CorrelationStore.js";
import { getLogiScouConfig } from "../initiator/state.js";
import { ServerTransporter } from "../services/transporter/ServerTransporter.js";


const serverTransporter = new ServerTransporter()

export function createCorrelationMiddleware() {
  return (req: any, res: any, next: any) => {
    const correlationId =
      req.headers["x-correlation-id"] ?? crypto.randomUUID();

    RequestContext.run(() => {
      const session = getOrCreateSession(correlationId, {
        projectName: getLogiScouConfig().projectName,
        environment: getLogiScouConfig().environment,
        correlationId,
        request: {
          method: req.method,
          path: req.originalUrl || req.url,
        },
      });

      res.setHeader("x-correlation-id", correlationId);

      console.log("----- SENDING TO THE SERVER-----------");

      res.on("finish", () => {
        session.request!.statusCode = res.statusCode;

        const payload = endSession(correlationId);

        if (payload) serverTransporter.transport(payload);

        removeSession(correlationId);
      });

      next();
    }, correlationId);
  };
}
