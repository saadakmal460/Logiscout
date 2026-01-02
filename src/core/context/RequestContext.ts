import { AsyncLocalStorage } from "async_hooks";
import { randomUUID } from "crypto";

export interface RequestContextData {
  correlationId: string;
}

const storage = new AsyncLocalStorage<RequestContextData>();

export class RequestContext {
  static run(fn: () => void, correlationId?: string): void {
    storage.run(
      {
        correlationId: correlationId ?? randomUUID(),
      },
      fn
    );
  }

  static getCorrelationId(): string | undefined {
    return storage.getStore()?.correlationId;
  }
}
