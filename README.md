# Logiscout

A structured logging library for Node.js applications with automatic correlation tracking and middleware support.

[![npm version](https://img.shields.io/npm/v/logiscout.svg)](https://www.npmjs.com/package/logiscout)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

## Features

- Structured logging with consistent JSON output
- Automatic correlation IDs for request-scoped logs
- Five log levels: `debug`, `info`, `warn`, `error`, and `critical`
- Exception capture for caught errors
- Express middleware for request tracking
- ESM and CommonJS support
- Exported TypeScript types and enums

## Installation

```bash
npm install logiscout
```

## Quick Start

### 1. Initialize

Call once at your application entry point:

```typescript
import { Environment, initLogiscout } from "logiscout";

initLogiscout({
  projectName: "my-app",
  environment: Environment.DEVELOPMENT,
  apiKey: "your-api-key",
});
```

### 2. Create a logger

```typescript
import { createLogger } from "logiscout";

const logger = createLogger("UserService");
```

### 3. Log

```typescript
logger.info("User logged in");
logger.warn("Rate limit approaching");
logger.error("Failed to process request");
logger.debug("Processing user data");
logger.critical("Database connection lost");

logger.info("User created", { userId: "123", email: "user@example.com" });

// Control server transport (only active in Environment.PRODUCTION)
logger.info("Order placed", { orderId: "789" }, { send: true });
logger.debug("Cache state", { keys: 42 }, { send: false });
```

## Express Integration

```typescript
import express from "express";
import {
  Environment,
  initLogiscout,
  createLogger,
  createCorrelationMiddleware,
} from "logiscout";

const app = express();

initLogiscout({
  projectName: "my-api",
  environment: Environment.PRODUCTION,
  apiKey: "your-api-key",
});

app.use(createCorrelationMiddleware());

const logger = createLogger("API");

app.get("/users", (req, res) => {
  logger.info("Fetching users", { page: req.query.page });
  res.json({ users: [] });
});

app.listen(3000);
```

The middleware:

- Generates a unique correlation ID per request, or reuses the incoming `x-correlation-id`
- Attaches the correlation ID to all logs within the request
- Sets the `x-correlation-id` response header
- Logs request start and end with method, path, status code, and response time

## Error Logging with Exceptions

```typescript
try {
  JSON.parse("{ invalid json }");
} catch (err) {
  logger.error("Failed to parse config", { source: "config-loader" }, err);
}
```

## API Reference

### `initLogiscout(config)`

Initialize the SDK. Must be called once before creating any loggers.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectName` | `string` | Yes | Name of your project |
| `environment` | `Environment` | Yes | Current environment |
| `apiKey` | `string` | No | API key for server transport |

Available `Environment` values:

- `Environment.DEVELOPMENT`
- `Environment.STAGING`
- `Environment.PRODUCTION`

### `createLogger(loggerName)`

Create a named logger instance.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `loggerName` | `string` | Yes | Name identifying this logger, such as a service or module name |

### Logger methods

```typescript
logger.info(message, meta?, options?);
logger.warn(message, meta?, options?);
logger.debug(message, meta?, options?);
logger.critical(message, meta?, options?);

// error has two overloads
logger.error(message, meta?, options?);
logger.error(message, meta, exception, options?);
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `message` | `string` | Yes | The log message |
| `meta` | `Record<string, unknown>` | No | Additional metadata |
| `exception` | `unknown` | No | A caught exception for `error()` |
| `options.send` | `boolean` | No | Send to server. Default is `true`, but it only sends in `Environment.PRODUCTION` |

### `createCorrelationMiddleware()`

Returns Express middleware for automatic correlation tracking.

```typescript
app.use(createCorrelationMiddleware());
```

## Log Levels

| Level | Severity | Use Case |
|-------|----------|----------|
| `debug` | 0 | Detailed debugging information |
| `info` | 1 | General operational information |
| `warn` | 2 | Warning conditions |
| `error` | 3 | Error conditions |
| `critical` | 4 | Critical failures requiring immediate attention |

## Console Output

```text
[2026-01-15T10:30:00.000Z] [INFO] [UserService] User logged in
  userId: "user_456"
```

## Requirements

- Node.js >= 18

## License

[MIT](LICENSE)

## Contributing

Issues and pull requests are welcome on [GitHub](https://github.com/saadakmal460/Logiscout).
