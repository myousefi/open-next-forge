import { blog, legal } from "@repo/cms";
import type { MetadataRoute } from "next";
import { env } from "@/env";
import { STATIC_PAGE_SEGMENTS } from "./static-pages";

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

const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
  const [blogPosts, legalPages] = await Promise.all([
    blog.getPosts(),
    legal.getPosts(),
  ]);

  const timestamp = new Date();

  return [
    {
      url: new URL("/", baseUrl).href,
      lastModified: timestamp,
    },
    ...STATIC_PAGE_SEGMENTS.map((segment) => ({
      url: new URL(segment, baseUrl).href,
      lastModified: timestamp,
    })),
    ...blogPosts.map((post) => ({
      url: new URL(`blog/${post._slug}`, baseUrl).href,
      lastModified: timestamp,
    })),
    ...legalPages.map((page) => ({
      url: new URL(`legal/${page._slug}`, baseUrl).href,
      lastModified: timestamp,
    })),
  ];
};

export default sitemap;
