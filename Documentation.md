# Logiscout

A structured logging library for Node.js applications with automatic correlation tracking and middleware support.

## Installation

```bash
npm install logiscout
```

## Quick Start

### 1. Initialize

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

### 3. Logging with levels

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

### 4. Error logging with exceptions

```typescript
try {
  JSON.parse("{ invalid json }");
} catch (err) {
  logger.error("Failed to parse config", { source: "config-loader" }, err);
}
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
