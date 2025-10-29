import "server-only";
import { keys } from "./keys";

type CapturePayload = {
  readonly event: string;
  readonly distinctId: string;
  readonly properties?: Record<string, unknown>;
};

type IdentifyPayload = {
  readonly distinctId: string;
  readonly properties?: Record<string, unknown>;
};

type GroupIdentifyPayload = {
  readonly groupKey: string;
  readonly groupType: string;
  readonly distinctId?: string;
  readonly properties?: Record<string, unknown>;
};

const { NEXT_PUBLIC_POSTHOG_KEY, NEXT_PUBLIC_POSTHOG_HOST } = keys();

const baseUrl = NEXT_PUBLIC_POSTHOG_HOST.replace(/\/?$/, "");

const send = async (path: string, body: Record<string, unknown>) => {
  if (!NEXT_PUBLIC_POSTHOG_KEY) {
    return;
  }

  try {
    await fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: NEXT_PUBLIC_POSTHOG_KEY,
        ...body,
      }),
    });
  } catch (error) {
    console.warn("Failed to send analytics event", error);
  }
};

const capture = async ({ event, distinctId, properties }: CapturePayload) =>
  send("/capture/", {
    event,
    distinct_id: distinctId,
    properties,
  });

const identify = async ({ distinctId, properties }: IdentifyPayload) =>
  send("/identify/", {
    distinct_id: distinctId,
    properties,
  });

const groupIdentify = async ({
  groupKey,
  groupType,
  distinctId,
  properties,
}: GroupIdentifyPayload) =>
  send("/groups/", {
    group_type: groupType,
    group_key: groupKey,
    distinct_id: distinctId,
    properties,
  });

export const analytics = {
  capture,
  identify,
  groupIdentify,
  shutdown: async () => {
    /* no batching to flush */
  },
};
