import "server-only";
import { auth } from "@repo/auth/server";
import { keys } from "../keys";

const svixToken = keys().SVIX_TOKEN;
const SVIX_API_BASE = "https://api.svix.com";

const request = async <T>(
  path: string,
  init: RequestInit & { parse?: "json" | "text" } = { parse: "json" }
): Promise<T> => {
  if (!svixToken) {
    throw new Error("SVIX_TOKEN is not set");
  }

  const response = await fetch(`${SVIX_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${svixToken}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  const parser = init.parse ?? "json";

  if (!response.ok) {
    const errorBody = parser === "json" ? await response.text() : "";
    throw new Error(
      `Svix request failed with status ${response.status}: ${errorBody}`
    );
  }

  if (parser === "json") {
    return (await response.json()) as T;
  }

  return (await response.text()) as T;
};

export const send = async (eventType: string, payload: object) => {
  const { orgId } = await auth();

  if (!orgId) {
    return;
  }

  return request(`/api/v1/app/${orgId}/msg`, {
    method: "POST",
    body: JSON.stringify({
      event_type: eventType,
      payload: {
        eventType,
        ...payload,
      },
      application: {
        name: orgId,
        uid: orgId,
      },
    }),
  });
};

export const getAppPortal = async () => {
  const { orgId } = await auth();

  if (!orgId) {
    return;
  }

  return request<{ url: string }>(`/api/v1/app/${orgId}/dashboard-access`, {
    method: "POST",
    body: JSON.stringify({
      application: {
        name: orgId,
        uid: orgId,
      },
    }),
  });
};
