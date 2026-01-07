export { LogLevels } from "./core/enum/LogLevels.js";
export { LoggerInterface } from "./core/interface/LoggerInterface.js";
export { LogEntry } from "./core/types/LogEntry.js";
export { Levels } from "./services/Levels/Levels.js";
export { Logger as BaseLogger } from "./services/Logger/Logger.js";
import { getLogiScouConfig } from "./initiator/state.js";
import { Levels } from "./services/Levels/Levels.js";

// const Logger = new Levels();
// export const createLogger = (component: string) =>
//   new Levels(component);


export {initLogiscout} from "./init.js"
export const createLogger = (component: string) => {
  const config = getLogiScouConfig();

  return new Levels(component, {
    projectName: config.projectName,
    environment: config.environment,
  });
};

export { createCorrelationMiddleware } from "./middlewares/correlationMiddleware.js";

// export { Logger };
