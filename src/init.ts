import { LogiscoutConfig, setConfig } from "./initiator/state.js";



export function initLogiscout(config: LogiscoutConfig) {
  if (!config.projectName) {
    throw new Error("projectName is required");
  }

  if (!config.environment) {
    throw new Error("environment is required");
  }

  setConfig(config);
}
