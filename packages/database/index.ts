import "server-only";

import type { D1Database } from "@cloudflare/workers-types";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { keys } from "./keys";
import * as schema from "./schema";

type DatabaseInstance = ReturnType<typeof drizzle<typeof schema>>;

const { CLOUDFLARE_D1_DATABASE } = keys();

let cached: DatabaseInstance | null = null;

const resolveBinding = async (): Promise<D1Database> => {
  const context = await getCloudflareContext({ async: true });
  const envBindings = context?.env as Record<string, unknown> | undefined;
  const binding = envBindings?.[CLOUDFLARE_D1_DATABASE];

  if (!binding) {
    throw new Error(
      `D1 binding "${CLOUDFLARE_D1_DATABASE}" is not available in this environment.`
    );
  }

  return binding as D1Database;
};

export const getDatabase = async (): Promise<DatabaseInstance> => {
  if (cached) {
    return cached;
  }

  const binding = await resolveBinding();
  const instance = drizzle(binding, { schema });

  if (process.env.NODE_ENV !== "production") {
    cached = instance;
  }

  return instance;
};

export * from "./schema";
