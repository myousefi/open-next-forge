"use client";

import type { PutObjectResult } from "./index";
import { keys } from "./keys";

export type UploadOptions = {
  readonly key?: string;
  readonly metadata?: Record<string, string>;
  readonly contentType?: string;
  readonly cacheControl?: string;
  readonly makePublic?: boolean;
};

export const upload = async (
  file: File | Blob,
  options: UploadOptions = {}
): Promise<PutObjectResult> => {
  const { NEXT_PUBLIC_STORAGE_UPLOAD_URL } = keys();

  if (!NEXT_PUBLIC_STORAGE_UPLOAD_URL) {
    throw new Error("NEXT_PUBLIC_STORAGE_UPLOAD_URL is not configured.");
  }

  const payload = new FormData();
  payload.append("file", file);

  if (options.key) {
    payload.append("key", options.key);
  }

  if (options.contentType) {
    payload.append("contentType", options.contentType);
  }

  if (options.cacheControl) {
    payload.append("cacheControl", options.cacheControl);
  }

  if (options.makePublic !== undefined) {
    payload.append("makePublic", String(options.makePublic));
  }

  for (const [key, value] of Object.entries(options.metadata ?? {})) {
    payload.append(`metadata[${key}]`, value);
  }

  const response = await fetch(NEXT_PUBLIC_STORAGE_UPLOAD_URL, {
    method: "POST",
    body: payload,
  });

  if (!response.ok) {
    throw new Error("Failed to upload file to Cloudflare R2");
  }

  return (await response.json()) as PutObjectResult;
};
