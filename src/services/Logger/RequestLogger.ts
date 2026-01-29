import winston from "winston";
import { ConsoleTransporter } from "../transporter/ConsoleTranspoter.js";

export class RequestLogger {
  private readonly logger: winston.Logger;
  private readonly consoleTransporter: ConsoleTransporter;
  constructor() {
    this.consoleTransporter = new ConsoleTransporter();
    this.logger = winston.createLogger({
      level: "info",
      transports: [this.consoleTransporter.transportRequest()],
    });
  }

  start(method: string, path: string) {
  this.logger.info("request:start", { phase: "start", method, path });
}

log(message: string) {
  this.logger.info("request:log", { phase: "log", message });
}

end(method: string, path: string, statusCode: number, durationMs: number) {
  this.logger.info("request:end", {
    phase: "end",
    method,
    path,
    statusCode,
    durationMs,
  });
}

}
