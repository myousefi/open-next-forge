import "server-only";
import { keys } from "../keys";
const endpoint = keys().OBSERVABILITY_STATUS_ENDPOINT;

export const Status = async () => {
  if (!endpoint) {
    return null;
  }

  let statusColor = "bg-muted-foreground";
  let statusLabel = "Unable to fetch status";
  let statusUrl = endpoint;

  try {
    const response = await fetch(endpoint, { cache: "no-store" });

    if (!response.ok) {
      throw new Error("Failed to fetch status");
    }

    const payload = (await response.json()) as {
      status?: string;
      url?: string;
      label?: string;
    };

    if (payload.url) {
      statusUrl = payload.url;
    }

    const normalized = payload.status?.toLowerCase() ?? "unknown";

    switch (normalized) {
      case "operational":
      case "ok":
        statusColor = "bg-success";
        statusLabel = payload.label ?? "All systems normal";
        break;
      case "degraded":
      case "partial":
      case "partial_outage":
        statusColor = "bg-warning";
        statusLabel = payload.label ?? "Partial outage";
        break;
      case "down":
      case "outage":
        statusColor = "bg-destructive";
        statusLabel = payload.label ?? "Degraded performance";
        break;
      default:
        statusColor = "bg-muted-foreground";
        statusLabel = payload.label ?? "Status unknown";
        break;
    }

    if (!payload.status && payload.label) {
      statusLabel = payload.label;
    }
  } catch {
    statusColor = "bg-muted-foreground";
    statusLabel = "Unable to fetch status";
  }

  return (
    <a
      className="flex items-center gap-3 font-medium text-sm"
      href={statusUrl}
      rel="noreferrer"
      target="_blank"
    >
      <span className="relative flex h-2 w-2">
        <span
          className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${statusColor}`}
        />
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${statusColor}`}
        />
      </span>
      <span className="text-muted-foreground">{statusLabel}</span>
    </a>
  );
};
