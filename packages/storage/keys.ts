import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const keys = () =>
  createEnv({
    server: {
      CLOUDFLARE_R2_ACCOUNT_ID: z.string().optional(),
      CLOUDFLARE_R2_ACCESS_KEY_ID: z.string().optional(),
      CLOUDFLARE_R2_SECRET_ACCESS_KEY: z.string().optional(),
      CLOUDFLARE_R2_BUCKET_NAME: z.string().optional(),
      CLOUDFLARE_R2_PUBLIC_BASE_URL: z.string().url().optional(),
    },
    client: {
      NEXT_PUBLIC_STORAGE_UPLOAD_URL: z.string().url().optional(),
    },
    runtimeEnv: {
      CLOUDFLARE_R2_ACCOUNT_ID: process.env.CLOUDFLARE_R2_ACCOUNT_ID,
      CLOUDFLARE_R2_ACCESS_KEY_ID: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
      CLOUDFLARE_R2_SECRET_ACCESS_KEY:
        process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
      CLOUDFLARE_R2_BUCKET_NAME: process.env.CLOUDFLARE_R2_BUCKET_NAME,
      CLOUDFLARE_R2_PUBLIC_BASE_URL:
        process.env.CLOUDFLARE_R2_PUBLIC_BASE_URL,
      NEXT_PUBLIC_STORAGE_UPLOAD_URL:
        process.env.NEXT_PUBLIC_STORAGE_UPLOAD_URL,
    },
  });
