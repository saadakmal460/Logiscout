import { Environment } from "../core/enum/Environment.js";

export type LogiscoutConfig = {
  projectName: string;
  environment: Environment;
  apiKey?: string;
};

let config: LogiscoutConfig | null = null;

export function setConfig(c: LogiscoutConfig) {
  if (config) {
    throw new Error("Logiscout has already been initialized");
  }
  config = c;
}

export function getLogiScouConfig(): LogiscoutConfig {
  if (!config) {
    throw new Error(
      "Logiscout is not initialized. Call initLogiscout() before using the SDK."
    );
  }
  return config;
}
