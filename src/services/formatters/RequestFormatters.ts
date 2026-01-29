export class RequestFormatter {
  static startRequest({ method, path }: any) {
    console.log(`Started ${method} ${path}`);
  }

  static log(message: string) {
    console.log(`  ${message}`);
  }

  static endRequest({ method, path, statusCode, duration }: any) {
    const dots = ".".repeat(
      Math.max(1, 40 - `${method} ${path}`.length)
    );

    console.log(
      `${method} ${path} ${dots} ${statusCode} (${duration}ms)`
    );
  }
}
