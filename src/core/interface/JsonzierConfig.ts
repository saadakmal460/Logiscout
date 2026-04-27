import { Environment } from "../enum/Environment.js";

export interface JsonizerConfig {
  projectName: string;
  environment: Environment;
  loggerName: string;
}
