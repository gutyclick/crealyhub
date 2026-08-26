type LogLevel = "debug" | "info" | "warn" | "error";
const secretPattern = /(token|secret|password|authorization|api[_-]?key)/i;

function redact(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, secretPattern.test(key) ? "[REDACTED]" : redact(item)]));
  }
  return value;
}

export function log(level: LogLevel, message: string, metadata: Record<string, unknown> = {}) {
  const entry = JSON.stringify({ level, message, metadata: redact(metadata), at: new Date().toISOString() });
  if (level === "error") console.error(entry);
  else if (level === "warn") console.warn(entry);
  else console.log(entry);
}
