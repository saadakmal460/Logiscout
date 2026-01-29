import { transports, transport } from "winston";
import formatLogs from "../../core/formatters/winston/FormatLogs.js";
import formatRequest from "../../core/formatters/winston/FormatRequests.js";

export class ConsoleTransporter {
  transport(): transport {
    return new transports.Console({
      format: formatLogs(),
    });
  }

  transportRequest(): transport {
    return new transports.Console({
      format: formatRequest(),
    });
  }
}
