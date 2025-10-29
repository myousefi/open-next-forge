import "server-only";
import { keys } from "./keys";

type AuthenticateOptions = {
  userId: string;
  orgId: string;
  userInfo: Record<string, unknown>;
};

const secret = keys().LIVEBLOCKS_SECRET;
const FULL_ACCESS = ["room:write", "comments:write"] as const;
const LIVEBLOCKS_API_BASE = "https://api.liveblocks.io";

export const authenticate = async ({
  userId,
  orgId,
  userInfo,
}: AuthenticateOptions) => {
  if (!secret) {
    throw new Error("LIVEBLOCKS_SECRET is not set");
  }

  const response = await fetch(`${LIVEBLOCKS_API_BASE}/v2/authorize-user`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId,
      permissions: {
        [`${orgId}:*`]: FULL_ACCESS,
      },
      userInfo,
    }),
  });

  const body = await response.text();

  return new Response(body, { status: response.status });
};
