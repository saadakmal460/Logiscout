import { format } from "winston";

export default function formatRequest() {
  return format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.printf(
      ({ timestamp, phase, method, path, statusCode, durationMs, message }) => {
        if (phase === "start") {
          return `
──────────────────────────────────────────────────────────────────────────────────────
▶ ${timestamp}  [${method}] ${path}
──────────────────────────────────────────────────────────────────────────────────────
`;
        }

        if (phase === "log") {
          return `${timestamp}   ${message}`;
        }

        if (phase === "end") {
          return `
──────────────────────────────────────────────────────────────────────────────────────
${timestamp}  [${method}] ${path}......................${statusCode} (${durationMs}ms)
──────────────────────────────────────────────────────────────────────────────────────`;
        }

        return "";
      },
    ),
  );
}
