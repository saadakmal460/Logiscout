import { LogiscoutConfig, setConfig } from "./initiator/state.js";
import { Environment } from "./core/enum/Environment.js";


export function initLogiscout(config: LogiscoutConfig) {
  if (!config.projectName) {
    throw new Error("projectName is required");
  }

  if (!Object.values(Environment).includes(config.environment)) {
    throw new Error(
      `environment must be one of: ${Object.values(Environment).join(", ")}`
    );
  }

  setConfig(config);
}
