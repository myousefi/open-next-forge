import { auth } from "@repo/auth/server";
import { keys } from "../keys";

type FlagMetadata = {
  readonly key: string;
  readonly description?: string;
  readonly options?: readonly string[];
  readonly origin?: string;
  readonly defaultValue: boolean;
};

type FlagEvaluator = (() => Promise<boolean>) & FlagMetadata;

const registry = new Map<string, FlagEvaluator>();

const evaluateWithService = async (
  key: string,
  userId: string,
  defaultValue: boolean
) => {
  const {
    FLAGS_SERVICE_URL,
    FLAGS_SERVICE_EVALUATION_TOKEN,
  } = keys();

  if (!FLAGS_SERVICE_URL || !FLAGS_SERVICE_EVALUATION_TOKEN) {
    return defaultValue;
  }

  try {
    const response = await fetch(`${FLAGS_SERVICE_URL}/evaluate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${FLAGS_SERVICE_EVALUATION_TOKEN}`,
      },
      body: JSON.stringify({ key, userId }),
      cache: "no-store",
    });

    if (!response.ok) {
      return defaultValue;
    }

    const { value } = (await response.json()) as { value?: boolean };

    return typeof value === "boolean" ? value : defaultValue;
  } catch (error) {
    console.error("Failed to evaluate feature flag", { error, key });

    return defaultValue;
  }
};

export const createFlag = (
  key: string,
  config: Partial<Omit<FlagMetadata, "key" | "defaultValue">> & {
    readonly defaultValue?: boolean;
  } = {}
) => {
  const metadata: FlagMetadata = {
    key,
    defaultValue: config.defaultValue ?? false,
    description: config.description,
    options: config.options,
    origin: config.origin ?? "cloudflare",
  };

  const evaluate = Object.assign(async () => {
    const session = await auth();

    if (!session?.userId) {
      return metadata.defaultValue;
    }

    return evaluateWithService(key, session.userId, metadata.defaultValue);
  }, metadata);

  registry.set(key, evaluate);

  return evaluate;
};

export const getRegisteredFlags = () => Array.from(registry.values());
