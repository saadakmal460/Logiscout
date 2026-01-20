import { LogLevels } from "../../enum/LogLevels";

export const LEVEL_COLORS: Record<LogLevels, string> = {
  [LogLevels.DEBUG]: "\x1b[90m",   // gray
  [LogLevels.INFO]: "\x1b[32m",    // green
  [LogLevels.WARN]: "\x1b[33m",    // yellow
  [LogLevels.ERROR]: "\x1b[31m",   // red
  [LogLevels.CRITICAL]: "\x1b[35m" // magenta
};