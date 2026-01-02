// import { Logger } from "../src";
// // Using the singleton Logger instance - Logger.info(), Logger.warn(), etc.
// Logger.info("Server started", { port: 3000 });
// Logger.warn("Low memory warning", { available: "512MB" });
// Logger.error("Database connection failed", { retry: true });
// Logger.debug("Debug information", { requestId: "abc-123" });
// // Simple log without metadata
// Logger.info("Application initialized");
// Logger.warn("Cache miss detected");
// Logger.error("Critical error occurred");
// Logger.debug("Variable state check");
import { createLogger } from "../src/index";
import { RequestContext } from "../src/core/context/RequestContext";
const Logger = createLogger("UserController");
RequestContext.run(() => {
    Logger.info("Controller layer");
    service();
}, "test-correlation-123");
function service() {
    Logger.info("Service layer");
    helper();
}
function helper() {
    Logger.info("Helper layer");
}
