import { keys } from "./keys";

const { CLOUDFLARE_LOGPUSH_URL, CLOUDFLARE_LOGPUSH_TOKEN } = keys();

type LogLevel = "debug" | "info" | "warn" | "error";

const send = async (
  level: LogLevel,
  message: string,
  metadata?: Record<string, unknown>
) => {
  if (!CLOUDFLARE_LOGPUSH_URL || !CLOUDFLARE_LOGPUSH_TOKEN) {
    console[level](message, metadata ?? {});
    return;
  }

  try {
    await fetch(CLOUDFLARE_LOGPUSH_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CLOUDFLARE_LOGPUSH_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        level,
        message,
        metadata,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (error) {
    console.warn("Failed to forward log entry", error);
  }
};

export const log = {
  debug: (message: string, metadata?: Record<string, unknown>) =>
    send("debug", message, metadata),
  info: (message: string, metadata?: Record<string, unknown>) =>
    send("info", message, metadata),
  warn: (message: string, metadata?: Record<string, unknown>) =>
    send("warn", message, metadata),
  error: (message: string, metadata?: Record<string, unknown>) =>
    send("error", message, metadata),
};
