import crypto from "crypto";

export function generateCorrelationId(
  projectName: string,
  componentName: string
): string {
  return `${projectName}-${componentName}-${crypto.randomUUID()}`;
}
