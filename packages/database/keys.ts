import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const keys = () =>
  createEnv({
    server: {
      CLOUDFLARE_D1_DATABASE: z.string().default("APP_DATABASE"),
    },
    runtimeEnv: {
      CLOUDFLARE_D1_DATABASE:
        process.env.CLOUDFLARE_D1_DATABASE ?? "APP_DATABASE",
    },
  });
