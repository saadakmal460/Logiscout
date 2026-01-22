import { throwError } from "../errors/ThrowError.js";


export default function validateComponentName(componentName:string){

    if (!componentName || typeof componentName !== "string") {
      throwError("Logger: Component name must be a non-empty string. " +
          "Usage: createLogger('ComponentName')")
    }

    if (componentName.length > 100) {
      throwError(
        "Logger: Component name cannot exceed 100 characters. " +
          `Received: '${componentName.substring(0, 20)}...'`,
      );
    }
}