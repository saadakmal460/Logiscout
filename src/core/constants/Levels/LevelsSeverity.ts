import { LogLevels } from "../../enum/LogLevels.js";


export const LOG_LEVEL_SEVERITY: Record<LogLevels, number> = {
  [LogLevels.CRITICAL]: 0,
  [LogLevels.ERROR]: 1,
  [LogLevels.WARN]: 2,
  [LogLevels.INFO]: 3,
  [LogLevels.DEBUG]: 4,
} as const;
