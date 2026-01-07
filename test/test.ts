import {createLogger, initLogiscout} from "../dist/esm/index.js"


/**
 * STEP 1: Initialize once (app root)
 */
initLogiscout({
  projectName: "logiscout-test",
  environment: "prod",
  apiKey: "test-api-key",
});

/**
 * STEP 2: Create logger
 */
const logger = createLogger("TestService");

/**
 * STEP 3: Log without correlation context
 */
console.log("\n--- Log without correlation context ---");
logger.info("Log without correlation ID");
logger.warn("Warn without correlation ID");

