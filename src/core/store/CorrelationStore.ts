import { CorrelationSession } from "../interface/CorrelationSession.js";

const sessions = new Map<string, CorrelationSession>();

export function getOrCreateSession(
  correlationId: string,
  base: Omit<CorrelationSession, "logs" | "startedAt">
): CorrelationSession {
  if (!sessions.has(correlationId)) {
    sessions.set(correlationId, {
      ...base,
      startedAt: new Date().toISOString(),
      logs: [],
    });
  }
  return sessions.get(correlationId)!;
}

export function endSession(correlationId: string) {
  const session = sessions.get(correlationId);
  if (!session) return;

  session.endedAt = new Date().toISOString();
  session.durationMs =
    new Date(session.endedAt).getTime() -
    new Date(session.startedAt).getTime();

  return session;
}

export function removeSession(correlationId: string) {
  sessions.delete(correlationId);
}
