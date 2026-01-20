import {transports } from "winston";
import formatLogs from "../core/formatters/winston/FormatLogs";

export default function consoleTranspoter() {
  return new transports.Console({
    format: formatLogs(),
  });
}
