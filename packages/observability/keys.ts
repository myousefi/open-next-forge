import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const keys = () =>
  createEnv({
    server: {
      CLOUDFLARE_LOGPUSH_URL: z.string().url().optional(),
      CLOUDFLARE_LOGPUSH_TOKEN: z.string().optional(),
      OBSERVABILITY_STATUS_ENDPOINT: z.string().url().optional(),

      // Added by Sentry Integration, Vercel Marketplace
      SENTRY_ORG: z.string().optional(),
      SENTRY_PROJECT: z.string().optional(),
    },
    client: {
      // Added by Sentry Integration, Vercel Marketplace
      NEXT_PUBLIC_SENTRY_DSN: z.url().optional(),
    },
    runtimeEnv: {
      CLOUDFLARE_LOGPUSH_URL: process.env.CLOUDFLARE_LOGPUSH_URL,
      CLOUDFLARE_LOGPUSH_TOKEN: process.env.CLOUDFLARE_LOGPUSH_TOKEN,
      OBSERVABILITY_STATUS_ENDPOINT:
        process.env.OBSERVABILITY_STATUS_ENDPOINT,
      SENTRY_ORG: process.env.SENTRY_ORG,
      SENTRY_PROJECT: process.env.SENTRY_PROJECT,
      NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    },
  });
