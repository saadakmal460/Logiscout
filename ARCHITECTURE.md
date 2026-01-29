# Logiscout - Architecture & Project Flow

This document describes the internal architecture, project structure, and data flow of the Logiscout SDK.

## Project Structure

```
src/
├── index.ts                      # Main entry point - exports public API
├── init.ts                       # SDK initialization function
│
├── api/                          # HTTP API layer
│   ├── Interceptor.ts            # Axios HTTP client configuration
│   └── LogApi.ts                 # API function to send logs to server
│
├── core/                         # Core types, interfaces, enums, constants
│   ├── constants/
│   │   └── Levels/
│   │       ├── LevelsColors.ts   # ANSI color codes for log levels
│   │       └── LevelsSeverity.ts # Numeric severity values for log levels
│   │
│   ├── context/
│   │   └── RequestContext.ts     # AsyncLocalStorage-based correlation context
│   │
│   ├── enum/
│   │   ├── LogLevels.ts          # Enum: INFO, WARN, ERROR, DEBUG, CRITICAL
│   │   └── LogPayLoads.ts        # Enum: SESSION, SINGLE payload types
│   │
│   ├── formatters/
│   │   └── winston/
│   │       └── FormatLogs.ts     # Winston format configuration
│   │
│   ├── interface/
│   │   ├── CorrelationSession.ts # Session interfaces for correlated logging
│   │   ├── JsonzierConfig.ts     # Config interface for Jsonizer
│   │   ├── LoggerInterface.ts    # Interface defining logger methods
│   │   ├── RequestContext.ts     # RequestContextData interface
│   │   └── payloads/
│   │       └── Payloads.ts       # Backend/Frontend payload interfaces
│   │
│   ├── store/
│   │   └── CorrelationStore.ts   # In-memory session storage (Map-based)
│   │
│   └── types/
│       ├── LogContext.ts         # LogContext type definition
│       └── LogEntry.ts           # LogEntry type definition
│
├── errors/
│   └── ThrowError.ts             # Centralized error throwing utility
│
├── initiator/
│   └── state.ts                  # Global SDK configuration state
│
├── middlewares/
│   └── correlationMiddleware.ts  # Express middleware for correlation tracking
│
├── services/
│   ├── formatters/
│   │   └── ConsoleFormatter.ts   # Console output formatting with colors
│   │
│   ├── Levels/
│   │   └── Levels.ts             # High-level logger with log level methods
│   │
│   ├── Logger/
│   │   └── Logger.ts             # Abstract base logger class
│   │
│   ├── processors/
│   │   └── Jsonizer.ts           # Log-to-JSON processor for sessions
│   │
│   └── transporter/
│       ├── ConsoleTranspoter.ts  # Winston console transport wrapper
│       └── ServerTransporter.ts  # HTTP transport to send logs to server
│
├── utils/
│   └── GenerateCorrelationId.ts  # Utility to generate correlation IDs
│
└── validator/
    ├── ValidateComponentName.ts  # Validates component name input
    ├── ValidateLogEntry.ts       # Validates log entry structure
    ├── ValidateLogLevel.ts       # Validates log level is valid enum
    ├── ValidateLogMessage.ts     # Validates log message is valid string
    └── ValidateRequestContext.ts # Validates RequestContext.run() params
```

## Class Hierarchy

```
LoggerInterface (interface)
       ▲
       │ implements
       │
    Levels (class)
       ▲
       │ extends
       │
    Logger (abstract class)
```

---

## Correlation ID System (Deep Dive)

The correlation ID system is the core feature that enables request tracing across your application. It uses Node.js's `AsyncLocalStorage` to maintain context without passing IDs through every function call.

### What is a Correlation ID?

A correlation ID is a unique identifier (UUID) that tags all logs belonging to a single HTTP request. This allows you to:
- Trace a request's entire journey through your application
- Group all logs from one request together
- Debug issues by filtering logs with the same correlation ID

### How AsyncLocalStorage Works

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        AsyncLocalStorage Concept                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Traditional Approach (without AsyncLocalStorage):                      │
│  ─────────────────────────────────────────────────                      │
│  Every function needs correlationId as parameter:                       │
│                                                                         │
│    handleRequest(req, correlationId) {                                  │
│      processUser(userId, correlationId)     // must pass it             │
│        └─> validateUser(user, correlationId)  // must pass it           │
│              └─> logAction(action, correlationId) // must pass it       │
│    }                                                                    │
│                                                                         │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                         │
│  With AsyncLocalStorage:                                                │
│  ───────────────────────                                                │
│  Context is automatically available in all async operations:            │
│                                                                         │
│    RequestContext.run(() => {                                           │
│      // correlationId is "abc-123" for everything inside                │
│      handleRequest(req)                                                 │
│        └─> processUser(userId)        // can access correlationId       │
│              └─> validateUser(user)     // can access correlationId     │
│                    └─> logger.info()      // automatically gets it!     │
│    }, "abc-123")                                                        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### RequestContext Implementation

```typescript
// core/context/RequestContext.ts

const storage = new AsyncLocalStorage<RequestContextData>();

export class RequestContext {
  // Creates an isolated context where correlationId is accessible
  static run(fn: () => void, correlationId?: string): void {
    const id = correlationId ?? randomUUID();

    storage.run(
      { correlationId: id },  // This data is available inside fn()
      fn                       // All code inside fn() can access the data
    );
  }

  // Retrieves correlationId from current async context
  static getCorrelationId(): string | undefined {
    const store = storage.getStore();
    return store?.correlationId;
  }
}
```

### Correlation ID Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     HTTP Request Arrives                                │
│                            │                                            │
│                            ▼                                            │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  Correlation Middleware                                          │   │
│  │  ────────────────────────                                        │   │
│  │  1. Check for "x-correlation-id" header                          │   │
│  │     - If exists: use it (for distributed tracing)                │   │
│  │     - If not: generate new UUID                                  │   │
│  │                                                                  │   │
│  │  correlationId = req.headers["x-correlation-id"] ?? randomUUID() │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                            │                                            │
│                            ▼                                            │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  RequestContext.run(() => { ... }, correlationId)                │   │
│  │  ────────────────────────────────────────────────                │   │
│  │                                                                  │   │
│  │  ┌────────────────────────────────────────────────────────────┐  │   │
│  │  │  ISOLATED ASYNC CONTEXT                                    │  │   │
│  │  │  correlationId = "abc-123-def-456"                         │  │   │
│  │  │                                                            │  │   │
│  │  │  ┌──────────────────────────────────────────────────────┐  │  │   │
│  │  │  │  Your Route Handler                                  │  │  │   │
│  │  │  │  ──────────────────                                  │  │  │   │
│  │  │  │  logger.info("Processing request")                   │  │  │   │
│  │  │  │       │                                              │  │  │   │
│  │  │  │       └──> RequestContext.getCorrelationId()         │  │  │   │
│  │  │  │            returns "abc-123-def-456"                 │  │  │   │
│  │  │  │                                                      │  │  │   │
│  │  │  │  await userService.findUser(id)                      │  │  │   │
│  │  │  │       │                                              │  │  │   │
│  │  │  │       └──> logger.debug("Finding user")              │  │  │   │
│  │  │  │            RequestContext.getCorrelationId()         │  │  │   │
│  │  │  │            still returns "abc-123-def-456"           │  │  │   │
│  │  │  │                                                      │  │  │   │
│  │  │  │  await database.query(...)                           │  │  │   │
│  │  │  │       │                                              │  │  │   │
│  │  │  │       └──> logger.info("Query executed")             │  │  │   │
│  │  │  │            Same correlationId!                       │  │  │   │
│  │  │  └──────────────────────────────────────────────────────┘  │  │   │
│  │  └────────────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                            │                                            │
│                            ▼                                            │
│                   Response Sent to Client                               │
│                   (with x-correlation-id header)                        │
└─────────────────────────────────────────────────────────────────────────┘
```

### Concurrent Requests - Context Isolation

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Multiple Concurrent Requests                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Request A (correlationId: "aaa-111")    Request B (correlationId: "bbb-222")
│  ─────────────────────────────────────   ─────────────────────────────────
│           │                                         │                   │
│           ▼                                         ▼                   │
│  ┌─────────────────────────┐              ┌─────────────────────────┐   │
│  │ AsyncLocalStorage       │              │ AsyncLocalStorage       │   │
│  │ Context A               │              │ Context B               │   │
│  │ correlationId: "aaa-111"│              │ correlationId: "bbb-222"│   │
│  │                         │              │                         │   │
│  │ logger.info("Start")    │              │ logger.info("Start")    │   │
│  │ // logs with "aaa-111"  │              │ // logs with "bbb-222"  │   │
│  │                         │              │                         │   │
│  │ await someAsyncOp()     │              │ await someAsyncOp()     │   │
│  │                         │              │                         │   │
│  │ logger.info("Done")     │              │ logger.info("Done")     │   │
│  │ // still "aaa-111"      │              │ // still "bbb-222"      │   │
│  └─────────────────────────┘              └─────────────────────────┘   │
│                                                                         │
│  Even though both requests run concurrently and share the same          │
│  logger instance, each maintains its own correlationId!                 │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Correlation Store System (Deep Dive)

The Correlation Store is an in-memory storage system that collects and aggregates all logs belonging to a single request session.

### Store Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       Correlation Store                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  const sessions = new Map<string, CorrelationSession>()                 │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                          Map Structure                            │  │
│  │  ─────────────────────────────────────────────────────────────    │  │
│  │                                                                   │  │
│  │  Key: "abc-123"  ──────►  Value: CorrelationSession {             │  │
│  │                              projectName: "my-app",               │  │
│  │                              environment: "prod",                 │  │
│  │                              correlationId: "abc-123",            │  │
│  │                              startedAt: "2024-01-15T10:30:00Z",   │  │
│  │                              request: {                           │  │
│  │                                method: "POST",                    │  │
│  │                                path: "/api/users",                │  │
│  │                              },                                   │  │
│  │                              logs: [                              │  │
│  │                                { level: "info", message: "..." }, │  │
│  │                                { level: "debug", message: "..."},  │  │
│  │                                { level: "info", message: "..." }, │  │
│  │                              ]                                    │  │
│  │                           }                                       │  │
│  │                                                                   │  │
│  │  Key: "def-456"  ──────►  Value: CorrelationSession { ... }       │  │
│  │                                                                   │  │
│  │  Key: "ghi-789"  ──────►  Value: CorrelationSession { ... }       │  │
│  │                                                                   │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Store Operations

```typescript
// core/store/CorrelationStore.ts

const sessions = new Map<string, CorrelationSession>();

// 1. GET OR CREATE SESSION
// Called when middleware starts OR when first log is made
export function getOrCreateSession(correlationId, base): CorrelationSession {
  if (!sessions.has(correlationId)) {
    sessions.set(correlationId, {
      ...base,
      startedAt: new Date().toISOString(),
      logs: [],  // Empty array to collect logs
    });
  }
  return sessions.get(correlationId)!;
}

// 2. END SESSION
// Called when HTTP response is finished
export function endSession(correlationId): CorrelationSession {
  const session = sessions.get(correlationId);
  if (!session) return;

  session.endedAt = new Date().toISOString();
  session.durationMs = endedAt - startedAt;  // Calculate duration

  return session;  // Return for server transport
}

// 3. REMOVE SESSION
// Called after sending to server (cleanup)
export function removeSession(correlationId): void {
  sessions.delete(correlationId);  // Free memory
}
```

### Session Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Session Lifecycle                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  PHASE 1: SESSION CREATION                                              │
│  ─────────────────────────                                              │
│                                                                         │
│  HTTP Request ──► Middleware ──► getOrCreateSession("abc-123")          │
│                                         │                               │
│                                         ▼                               │
│                               ┌─────────────────────┐                   │
│                               │ Session Created     │                   │
│                               │ ─────────────────   │                   │
│                               │ correlationId       │                   │
│                               │ startedAt           │                   │
│                               │ request.method      │                   │
│                               │ request.path        │                   │
│                               │ logs: []            │                   │
│                               └─────────────────────┘                   │
│                                                                         │
│  ───────────────────────────────────────────────────────────────────    │
│                                                                         │
│  PHASE 2: LOG ACCUMULATION                                              │
│  ─────────────────────────                                              │
│                                                                         │
│  logger.info("Step 1") ──► Jsonizer.appendLog() ──► session.logs.push() │
│  logger.debug("Step 2") ──► Jsonizer.appendLog() ──► session.logs.push()│
│  logger.info("Step 3") ──► Jsonizer.appendLog() ──► session.logs.push() │
│                                         │                               │
│                                         ▼                               │
│                               ┌─────────────────────┐                   │
│                               │ Session Updated     │                   │
│                               │ ─────────────────   │                   │
│                               │ logs: [             │                   │
│                               │   { "Step 1"... },  │                   │
│                               │   { "Step 2"... },  │                   │
│                               │   { "Step 3"... },  │                   │
│                               │ ]                   │                   │
│                               └─────────────────────┘                   │
│                                                                         │
│  ───────────────────────────────────────────────────────────────────    │
│                                                                         │
│  PHASE 3: SESSION END & TRANSPORT                                       │
│  ────────────────────────────────                                       │
│                                                                         │
│  Response Finish Event                                                  │
│         │                                                               │
│         ▼                                                               │
│  endSession("abc-123")                                                  │
│         │                                                               │
│         ▼                                                               │
│  ┌─────────────────────────────────────┐                                │
│  │ Final Session                       │                                │
│  │ ─────────────────                   │                                │
│  │ correlationId: "abc-123"            │                                │
│  │ startedAt: "10:30:00.000Z"          │                                │
│  │ endedAt: "10:30:00.250Z"            │                                │
│  │ durationMs: 250                     │                                │
│  │ request.statusCode: 200             │                                │
│  │ logs: [3 entries]                   │                                │
│  └─────────────────────────────────────┘                                │
│         │                                                               │
│         ▼                                                               │
│  ServerTransporter.transport(session) ──► HTTP POST to backend          │
│         │                                                               │
│         ▼                                                               │
│  removeSession("abc-123") ──► Map.delete() ──► Memory freed             │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Jsonizer: The Log Aggregator

The Jsonizer service bridges the Logger and the Correlation Store:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Jsonizer Role                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Logger.log(entry)                                                      │
│       │                                                                 │
│       ├──► Console Output (immediate)                                   │
│       │                                                                 │
│       └──► Jsonizer.appendLog(correlationId, entry)                     │
│                   │                                                     │
│                   ▼                                                     │
│            ┌─────────────────────────────────────────┐                  │
│            │  Jsonizer.appendLog()                   │                  │
│            │  ───────────────────                    │                  │
│            │                                         │                  │
│            │  1. Get or create session from store    │                  │
│            │     session = getOrCreateSession(...)   │                  │
│            │                                         │                  │
│            │  2. Push log to session's logs array    │                  │
│            │     session.logs.push({                 │                  │
│            │       timestamp,                        │                  │
│            │       level,                            │                  │
│            │       message,                          │                  │
│            │       meta,                             │                  │
│            │       component                         │                  │
│            │     })                                  │                  │
│            │                                         │                  │
│            │  3. Return updated session              │                  │
│            └─────────────────────────────────────────┘                  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Complete Request Flow (End-to-End)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     COMPLETE REQUEST FLOW                               │
└─────────────────────────────────────────────────────────────────────────┘

  CLIENT                    EXPRESS APP                         BACKEND SERVER
    │                           │                                    │
    │  POST /api/users          │                                    │
    │  x-correlation-id: null   │                                    │
    │ ─────────────────────────►│                                    │
    │                           │                                    │
    │                    ┌──────┴──────┐                              │
    │                    │  MIDDLEWARE │                              │
    │                    └──────┬──────┘                              │
    │                           │                                    │
    │                    Generate correlationId                      │
    │                    "abc-123-def-456"                           │
    │                           │                                    │
    │                    RequestContext.run(() => {                  │
    │                           │                                    │
    │                    getOrCreateSession()                        │
    │                    ┌─────────────────────┐                     │
    │                    │ SESSION CREATED     │                     │
    │                    │ id: "abc-123..."    │                     │
    │                    │ logs: []            │                     │
    │                    └─────────────────────┘                     │
    │                           │                                    │
    │                    Set response header                         │
    │                    x-correlation-id: "abc-123..."              │
    │                           │                                    │
    │                    ┌──────┴──────┐                              │
    │                    │   HANDLER   │                              │
    │                    └──────┬──────┘                              │
    │                           │                                    │
    │                    logger.info("Creating user")                │
    │                           │                                    │
    │                    ┌──────┴──────────────────────────┐         │
    │                    │ Logger.log()                    │         │
    │                    │ ─────────────                   │         │
    │                    │ 1. Get correlationId from       │         │
    │                    │    RequestContext               │         │
    │                    │                                 │         │
    │                    │ 2. Output to console            │         │
    │                    │    [INFO] Creating user         │         │
    │                    │    correlationId: abc-123...    │         │
    │                    │                                 │         │
    │                    │ 3. Jsonizer.appendLog()         │         │
    │                    │    session.logs.push(...)       │         │
    │                    └─────────────────────────────────┘         │
    │                           │                                    │
    │                    ... more operations & logs ...              │
    │                           │                                    │
    │                    logger.info("User created")                 │
    │                           │                                    │
    │                    res.json({ success: true })                 │
    │                           │                                    │
    │                    ┌──────┴──────┐                              │
    │                    │ RES FINISH  │                              │
    │                    └──────┬──────┘                              │
    │                           │                                    │
    │                    session.request.statusCode = 200            │
    │                           │                                    │
    │                    endSession("abc-123...")                    │
    │                    ┌─────────────────────────┐                 │
    │                    │ SESSION COMPLETE        │                 │
    │                    │ id: "abc-123..."        │                 │
    │                    │ duration: 150ms         │                 │
    │                    │ status: 200             │                 │
    │                    │ logs: [5 entries]       │                 │
    │                    └─────────────────────────┘                 │
    │                           │                                    │
    │                    ServerTransporter.transport(session)        │
    │                           │ ──────────────────────────────────►│
    │                           │         POST /logs                 │
    │                           │         { session payload }        │
    │                           │                                    │
    │                    removeSession("abc-123...")                 │
    │                    (memory cleanup)                            │
    │                           │                                    │
    │                    }, correlationId)                           │
    │                    // End RequestContext.run                   │
    │                           │                                    │
    │◄──────────────────────────│                                    │
    │  Response                 │                                    │
    │  x-correlation-id:        │                                    │
    │  "abc-123-def-456"        │                                    │
```

---

## Key Data Structures

### LogEntry

```typescript
interface LogEntry {
  message: string;
  meta?: Record<string, unknown>;
  timestamp: string;
  level: LogLevels;
  correlationId?: string;
  send?: boolean;
}
```

### CorrelationSession

```typescript
interface CorrelationSession {
  projectName: string;
  environment: string;
  correlationId: string;
  component?: string;
  startedAt: string;
  endedAt?: string;
  durationMs?: number;
  request?: {
    method?: string;
    path?: string;
    statusCode?: number;
  };
  logs: Array<{
    timestamp: string;
    level: LogLevels;
    message: string;
    meta?: Record<string, unknown>;
    component?: string;
  }>;
}
```

### LogiscoutConfig

```typescript
type LogiscoutConfig = {
  projectName: string;
  environment: "dev" | "staging" | "prod" | string;
  apiKey?: string;
};
```

---

## Log Levels

| Level    | Severity | Color   | Use Case                                |
|----------|----------|---------|----------------------------------------|
| DEBUG    | 4        | Gray    | Detailed debugging information          |
| INFO     | 3        | Green   | General operational information         |
| WARN     | 2        | Yellow  | Warning conditions                      |
| ERROR    | 1        | Red     | Error conditions                        |
| CRITICAL | 0        | Magenta | Critical conditions, immediate action   |

---

## Transport Layer

### ConsoleTransporter

- Wraps Winston's Console transport
- Uses FormatLogs for structured formatting
- Applies ConsoleFormatter for colored terminal output

### ServerTransporter

- Sends logs to remote server via LogApi
- Handles two payload types:
  - **SESSION**: Correlated backend logs (batched per request)
  - **SINGLE**: Non-correlated/frontend logs (sent immediately)

---

## Public API

```typescript
// Initialization (call once at app startup)
initLogiscout({
  projectName: string,
  environment: "dev" | "staging" | "prod",
  apiKey?: string
})

// Create component-specific logger
const logger = createLogger("ComponentName")

// Log methods
logger.info(message, meta?, { send?: boolean })
logger.warn(message, meta?, { send?: boolean })
logger.error(message, meta?, { send?: boolean })
logger.debug(message, meta?, { send?: boolean })
logger.critical(message, meta?, { send?: boolean })

// Express middleware
app.use(createCorrelationMiddleware())

// Type exports
LogLevels       // Enum
LoggerInterface // Interface
LogEntry        // Type
Levels          // Class
BaseLogger      // Abstract class
```
