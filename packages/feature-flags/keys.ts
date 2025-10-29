import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const keys = () =>
  createEnv({
    server: {
      FLAGS_SECRET: z.string().optional(),
      FLAGS_SERVICE_URL: z.string().url().optional(),
      FLAGS_SERVICE_EVALUATION_TOKEN: z.string().optional(),
      FLAGS_SERVICE_ADMIN_TOKEN: z.string().optional(),
    },
    client: {
      NEXT_PUBLIC_FLAGS_TOOLBAR_SCRIPT_URL: z.string().url().optional(),
    },
    runtimeEnv: {
      FLAGS_SECRET: process.env.FLAGS_SECRET,
      FLAGS_SERVICE_URL: process.env.FLAGS_SERVICE_URL,
      FLAGS_SERVICE_EVALUATION_TOKEN:
        process.env.FLAGS_SERVICE_EVALUATION_TOKEN,
      FLAGS_SERVICE_ADMIN_TOKEN: process.env.FLAGS_SERVICE_ADMIN_TOKEN,
      NEXT_PUBLIC_FLAGS_TOOLBAR_SCRIPT_URL:
        process.env.NEXT_PUBLIC_FLAGS_TOOLBAR_SCRIPT_URL,
    },
  });
