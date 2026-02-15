export { LogLevels } from "./core/enum/LogLevels.js";
export { LoggerInterface } from "./core/interface/LoggerInterface.js";
export { LogEntry } from "./core/types/LogEntry.js";
export { Levels } from "./services/Levels/Levels.js";
export { Logger as BaseLogger } from "./services/Logger/Logger.js";
import { getLogiScouConfig } from "./initiator/state.js";
import { Levels } from "./services/Levels/Levels.js";

// const Logger = new Levels();
// export const createLogger = (logger: string) =>
//   new Levels(logger);


export {initLogiscout} from "./init.js"
export const createLogger = (logger: string) => {
  const config = getLogiScouConfig();

  return new Levels(logger, {
    projectName: config.projectName,
    environment: config.environment,
  });
};

export { createCorrelationMiddleware } from "./middlewares/CorrelationMiddleware.js";

// export { Logger };
