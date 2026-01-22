# Logiscout

A structured logging library for Node.js applications with correlation tracking, Winston integration, and multi-environment support.

[![npm version](https://img.shields.io/npm/v/logiscout.svg)](https://www.npmjs.com/package/logiscout)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- **Structured Logging** - JSON-formatted logs with consistent schema
- **Correlation IDs** - Track requests across your application with automatic correlation ID propagation
- **Multiple Log Levels** - `info`, `warn`, `error`, `debug`, and `critical`
- **Express Middleware** - Built-in middleware for automatic request correlation
- **Winston Powered** - Built on top of Winston for reliable, extensible logging
- **TypeScript Support** - Full TypeScript support with exported types
- **ESM & CommonJS** - Dual module support

## Installation

```bash
npm install logiscout
```

## Quick Start

### 1. Initialize Logiscout

Initialize once at your application's entry point:

```typescript
import { initLogiscout } from 'logiscout';

initLogiscout({
  projectName: 'my-app',
  environment: 'dev', // 'dev' | 'staging' | 'prod'
  apiKey: 'your-api-key' // optional
});
```

### 2. Create a Logger

Create component-specific loggers:

```typescript
import { createLogger } from 'logiscout';

const logger = createLogger('UserService');
```

### 3. Start Logging

```typescript
// Basic logging
logger.info('User logged in');
logger.warn('Rate limit approaching');
logger.error('Failed to process request');
logger.debug('Processing user data');
logger.critical('Database connection lost');

// With metadata
logger.info('User created', { userId: '123', email: 'user@example.com' });

// Control server transport (in production)
logger.error('Payment failed', { orderId: '456' }, { send: true });
logger.debug('Debug info', { data: 'value' }, { send: false });
```

## Express Integration

Use the correlation middleware to automatically track requests:

```typescript
import express from 'express';
import { initLogiscout, createLogger, createCorrelationMiddleware } from 'logiscout';

const app = express();

// Initialize Logiscout
initLogiscout({
  projectName: 'my-api',
  environment: 'prod'
});

// Add correlation middleware
app.use(createCorrelationMiddleware());

// Create logger
const logger = createLogger('API');

app.get('/users', (req, res) => {
  // Correlation ID is automatically attached to all logs
  logger.info('Fetching users');
  res.json({ users: [] });
});

app.listen(3000);
```

The middleware:
- Generates a unique correlation ID for each request (or uses `x-correlation-id` header if provided)
- Attaches the correlation ID to all logs within the request context
- Sets `x-correlation-id` response header
- Tracks request method, path, and status code

## API Reference

### `initLogiscout(config)`

Initialize the Logiscout SDK. Must be called before creating any loggers.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectName` | `string` | Yes | Name of your project |
| `environment` | `'dev' \| 'staging' \| 'prod' \| string` | Yes | Current environment |
| `apiKey` | `string` | No | API key for server transport |

### `createLogger(componentName)`

Create a new logger instance for a specific component.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `componentName` | `string` | Yes | Name of the component/service |

Returns a logger instance with the following methods:

### Logger Methods

All logging methods have the same signature:

```typescript
logger.info(message: string, meta?: Record<string, unknown>, options?: { send?: boolean }): void
logger.warn(message: string, meta?: Record<string, unknown>, options?: { send?: boolean }): void
logger.error(message: string, meta?: Record<string, unknown>, options?: { send?: boolean }): void
logger.debug(message: string, meta?: Record<string, unknown>, options?: { send?: boolean }): void
logger.critical(message: string, meta?: Record<string, unknown>, options?: { send?: boolean }): void
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `message` | `string` | Yes | Log message |
| `meta` | `Record<string, unknown>` | No | Additional metadata |
| `options.send` | `boolean` | No | Whether to send to server (default: `true`, only active in `prod`) |

### `createCorrelationMiddleware()`

Creates an Express middleware for request correlation tracking.

## Log Levels

| Level | Severity | Use Case |
|-------|----------|----------|
| `debug` | 0 | Detailed debugging information |
| `info` | 1 | General operational information |
| `warn` | 2 | Warning conditions |
| `error` | 3 | Error conditions |
| `critical` | 4 | Critical conditions requiring immediate attention |

## TypeScript

Logiscout exports types for TypeScript users:

```typescript
import {
  LogLevels,           // Enum of log levels
  LoggerInterface,     // Logger interface
  LogEntry,            // Log entry type
  Levels,              // Logger class (if you need to extend)
  BaseLogger           // Base logger class
} from 'logiscout';
```

## Log Output

Logs are output to the console in a formatted structure:

```
[2024-01-15T10:30:00.000Z] [INFO] [UserService] User logged in
  correlationId: "abc-123-def"
  userId: "user_456"
```

## Requirements

- Node.js >= 18

## License

MIT

## Contributing

Issues and pull requests are welcome at [GitHub](https://github.com/saadakmal460/Logiscout).
