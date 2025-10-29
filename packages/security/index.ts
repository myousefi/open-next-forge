import arcjet, {
  type ArcjetBotCategory,
  type ArcjetRequest,
  type ArcjetWellKnownBot,
  detectBot,
  shield,
} from "arcjet";
import { Logger } from "@arcjet/logger";
import { createClient } from "@arcjet/protocol/client";
import { createTransport } from "@arcjet/transport/workerd.js";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { keys } from "./keys";

const arcjetKey = keys().ARCJET_KEY;

const ARCJET_BASE_URL = "https://api.arcjet.com";
const ARCJET_SDK_STACK = "NEXTJS";
const ARCJET_SDK_VERSION = "1.0.0-beta.13";

let arcjetClient: ReturnType<typeof arcjet> | null = null;

const getArcjetClient = () => {
  if (!arcjetKey) {
    return null;
  }

  if (arcjetClient) {
    return arcjetClient;
  }

  const client = createClient({
    transport: createTransport(ARCJET_BASE_URL),
    baseUrl: ARCJET_BASE_URL,
    timeout: process.env.NODE_ENV === "development" ? 1000 : 500,
    sdkStack: ARCJET_SDK_STACK,
    sdkVersion: ARCJET_SDK_VERSION,
  });

  arcjetClient = arcjet({
    key: arcjetKey,
    client,
    log: new Logger({ level: "warn" }),
    characteristics: ["ip.src"],
    rules: [
      shield({
        mode: "LIVE",
      }),
    ],
  });

  return arcjetClient;
};

const resolveRequestContext = async (sourceRequest?: Request) => {
  if (sourceRequest) {
    return { request: sourceRequest };
  }

  const context = await getCloudflareContext({ async: true });
  const adapterContext = context.ctx as
    | { request?: Request; waitUntil?: (promise: Promise<unknown>) => void }
    | undefined;

  const request = adapterContext?.request;

  if (!request) {
    throw new Error("Unable to resolve the current request for Arcjet");
  }

  return { request, waitUntil: adapterContext?.waitUntil };
};

const buildArcjetRequest = (
  request: Request
): ArcjetRequest<Record<string, unknown>> => {
  const url = new URL(request.url);
  const headers = new Headers(request.headers);
  const ipHeader =
    headers.get("cf-connecting-ip") ?? headers.get("x-forwarded-for") ?? "";
  const ip = ipHeader.split(",").at(0)?.trim() ?? "";

  return {
    ip,
    method: request.method,
    protocol: url.protocol,
    host: url.host,
    path: url.pathname,
    query: url.search,
    headers,
    cookies: headers.get("cookie") ?? "",
  };
};

export const secure = async (
  allow: (ArcjetWellKnownBot | ArcjetBotCategory)[],
  sourceRequest?: Request
) => {
  const client = getArcjetClient();

  if (!client) {
    return;
  }

  const { request, waitUntil } = await resolveRequestContext(sourceRequest);
  const aj = client.withRule(detectBot({ mode: "LIVE", allow }));
  const arcjetRequest = buildArcjetRequest(request);
  const bodyGetter = async () => {
    try {
      const clone = request.clone();
      const text = await clone.text();

      return text.length > 0 ? text : undefined;
    } catch {
      return undefined;
    }
  };
  const context = {
    getBody: bodyGetter,
    waitUntil,
  };
  const decision = await aj.protect(context, arcjetRequest);

  if (decision.isDenied()) {
    if (decision.reason.isBot()) {
      throw new Error("No bots allowed");
    }

    if (decision.reason.isRateLimit()) {
      throw new Error("Rate limit exceeded");
    }

    throw new Error("Access denied");
  }
};
