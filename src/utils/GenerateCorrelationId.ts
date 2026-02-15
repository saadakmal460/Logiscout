import crypto from "crypto";

export function generateCorrelationId(
  projectName: string,
  loggerName: string
): string {
  return `${projectName}-${loggerName}-${crypto.randomUUID()}`;
}
