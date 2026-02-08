export default function normalizeException(err: unknown): Record<string, unknown> {
  if (err instanceof Error) {
    return {
      ...err,
      name: err.name,
      message: err.message,
      stack: err.stack,
    };
  }

  if (typeof err === "object" && err !== null) {
    return { ...err };
  }

  return { value: err };
}
