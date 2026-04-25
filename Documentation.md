# LogiScout


A structured logging library for Node.js applications with automatic correlation tracking with middleware support

## Installation

```js

npm install logiscout

```

  

## Quick Start


### 1. Initialize


```typescript

  

import { initLogiscout } from 'logiscout';


initLogiscout({

  

  projectName: 'my-app',

  

  environment: 'dev',     // 'dev' | 'staging' | 'prod'

  

  apiKey: 'your-api-key'  // optional

  

});

  

```


### 2. Create a Logger  

```typescript
import { createLogger } from 'logiscout';

const logger = createLogger('UserService');  

```


### 3. Logging with levels


```typescript

// Basic logging

logger.info('User logged in');

  

logger.warn('Rate limit approaching');

  

logger.error('Failed to process request');

  

logger.debug('Processing user data');

  

logger.critical('Database connection lost');


// With metadata
logger.info('User created', { userId: '123', email: 'user@example.com' });

  
// Control server transport (production only)

logger.info('Order placed', { orderId: '789' }, { send: true });
logger.debug('Cache state', { keys: 42 }, { send: false });

```


### 4. Error Logging with Exceptions
```typescript

try {

  JSON.parse('{ invalid json }');  

} catch (err) {

  logger.error(

    'Failed to parse config',
    { source: 'config-loader' },
    err

  );
}

```



## Express Integration
  

```typescript

import express from 'express';

import { initLogiscout, createLogger, createCorrelationMiddleware } from 'logiscout';

const app = express();

initLogiscout({

  projectName: 'my-api',
  environment: 'prod',
  apiKey: 'your-api-key'
});

app.use(createCorrelationMiddleware());


const logger = createLogger('API');


app.get('/users', (req, res) => {

  logger.info('Fetching users', { page: req.query.page });

  res.json({ users: [] });  

});

app.listen(3000);

```

  


## API Reference for Using Logiscout Services


### `initLogiscout(config)`
  

Initialize the SDK. Must be called once before creating any loggers.


| Parameter | Type | Required | Description |
  
|-----------|------|----------|-------------|


| `projectName` | `string` | Yes | Name of your project |
  
| `environment` | `'dev' \| 'staging' \| 'prod'` | Yes | Current environment |
  

| `apiKey` | `string` | No | API key for server transport |