import { transports, transport } from "winston";
import formatLogs from "../../core/formatters/winston/FormatLogs.js";

export class ConsoleTransporter {
  transport(): transport {
    return new transports.Console({
      format: formatLogs(),
    });
  }
}
