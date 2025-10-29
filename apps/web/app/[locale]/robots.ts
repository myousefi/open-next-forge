import type { MetadataRoute } from "next";
import { env } from "@/env";

const getBaseUrl = () => {
  const fallback = env.NEXT_PUBLIC_WEB_URL;
  const origin = env.WEB_ORIGIN ?? fallback;

  try {
    return new URL(origin);
  } catch {
    return new URL(fallback);
  }
};

const baseUrl = getBaseUrl();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: new URL("/sitemap.xml", baseUrl.href).href,
  };
}
