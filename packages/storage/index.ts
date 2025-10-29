import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
  type DeleteObjectCommandOutput,
  type GetObjectCommandOutput,
  type ListObjectsV2CommandOutput,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { keys } from "./keys";

type PutBody =
  | ArrayBuffer
  | ArrayBufferView
  | Blob
  | string
  | Uint8Array;

export type PutOptions = {
  readonly contentType?: string;
  readonly cacheControl?: string;
  readonly metadata?: Record<string, string>;
  readonly makePublic?: boolean;
};

export type PutObjectResult = {
  readonly key: string;
  readonly size: number;
  readonly url: string;
  readonly uploadedAt: string;
};

export type GetObjectResult = {
  readonly key: string;
  readonly body: Uint8Array | null;
  readonly size: number;
  readonly contentType?: string;
  readonly metadata?: Record<string, string>;
};

export type ListObjectResult = {
  readonly key: string;
  readonly size: number;
  readonly etag?: string;
  readonly lastModified?: Date;
};

let client: S3Client | null = null;

const ensureClient = () => {
  const {
    CLOUDFLARE_R2_ACCOUNT_ID,
    CLOUDFLARE_R2_ACCESS_KEY_ID,
    CLOUDFLARE_R2_SECRET_ACCESS_KEY,
    CLOUDFLARE_R2_BUCKET_NAME,
    CLOUDFLARE_R2_PUBLIC_BASE_URL,
  } = keys();

  if (
    !CLOUDFLARE_R2_ACCOUNT_ID ||
    !CLOUDFLARE_R2_ACCESS_KEY_ID ||
    !CLOUDFLARE_R2_SECRET_ACCESS_KEY ||
    !CLOUDFLARE_R2_BUCKET_NAME
  ) {
    throw new Error(
      "Cloudflare R2 environment variables are not fully configured."
    );
  }

  if (!client) {
    client = new S3Client({
      region: "auto",
      endpoint: `https://${CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: CLOUDFLARE_R2_ACCESS_KEY_ID,
        secretAccessKey: CLOUDFLARE_R2_SECRET_ACCESS_KEY,
      },
    });
  }

  return {
    client,
    bucket: CLOUDFLARE_R2_BUCKET_NAME,
    publicBaseUrl: CLOUDFLARE_R2_PUBLIC_BASE_URL,
  };
};

const toUint8Array = async (value: PutBody): Promise<Uint8Array> => {
  if (typeof value === "string") {
    return new TextEncoder().encode(value);
  }

  if (value instanceof Uint8Array) {
    return value;
  }

  if (value instanceof ArrayBuffer) {
    return new Uint8Array(value);
  }

  if (ArrayBuffer.isView(value)) {
    return new Uint8Array(value.buffer);
  }

  if (typeof Blob !== "undefined" && value instanceof Blob) {
    return new Uint8Array(await value.arrayBuffer());
  }

  throw new TypeError("Unsupported body type for R2 upload");
};

const readBody = async (
  body: GetObjectCommandOutput["Body"]
): Promise<Uint8Array | null> => {
  if (!body) {
    return null;
  }

  if (body instanceof Uint8Array) {
    return body;
  }

  if (typeof Blob !== "undefined" && body instanceof Blob) {
    return new Uint8Array(await body.arrayBuffer());
  }

  if (typeof (body as ReadableStream<Uint8Array>).getReader === "function") {
    const reader = (body as ReadableStream<Uint8Array>).getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      if (value) {
        chunks.push(value);
        size += value.byteLength;
      }
    }

    const combined = new Uint8Array(size);
    let offset = 0;

    for (const chunk of chunks) {
      combined.set(chunk, offset);
      offset += chunk.byteLength;
    }

    return combined;
  }

  if (
    typeof (body as AsyncIterable<Uint8Array>)[Symbol.asyncIterator] === "function"
  ) {
    const chunks: Uint8Array[] = [];
    let size = 0;

    for await (const chunk of body as AsyncIterable<unknown>) {
      const data = normalizeChunk(chunk);

      chunks.push(data);
      size += data.byteLength;
    }

    const combined = new Uint8Array(size);
    let offset = 0;

    for (const chunk of chunks) {
      combined.set(chunk, offset);
      offset += chunk.byteLength;
    }

    return combined;
  }

  return null;
};

const normalizeChunk = (chunk: unknown): Uint8Array => {
  if (typeof chunk === "string") {
    return new TextEncoder().encode(chunk);
  }

  if (chunk instanceof Uint8Array) {
    return chunk;
  }

  if (chunk instanceof ArrayBuffer) {
    return new Uint8Array(chunk);
  }

  if (ArrayBuffer.isView(chunk as ArrayBufferView)) {
    return new Uint8Array((chunk as ArrayBufferView).buffer);
  }

  throw new TypeError("Unsupported chunk type returned from R2");
};

const resolvePublicUrl = async (key: string, makePublic?: boolean) => {
  const { client, bucket, publicBaseUrl } = ensureClient();

  if (makePublic && publicBaseUrl) {
    const base = publicBaseUrl.replace(/\/$/, "");

    return `${base}/${key}`;
  }

  return getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: bucket, Key: key }),
    { expiresIn: 60 * 60 }
  );
};

export const put = async (
  key: string,
  value: PutBody,
  options: PutOptions = {}
): Promise<PutObjectResult> => {
  const { client, bucket } = ensureClient();
  const body = await toUint8Array(value);

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: options.contentType,
      CacheControl: options.cacheControl,
      Metadata: options.metadata,
    })
  );

  return {
    key,
    size: body.byteLength,
    url: await resolvePublicUrl(key, options.makePublic),
    uploadedAt: new Date().toISOString(),
  };
};

export const get = async (key: string): Promise<GetObjectResult> => {
  const { client, bucket } = ensureClient();
  const result = await client.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );

  const body = await readBody(result.Body);

  return {
    key,
    body,
    size: body?.byteLength ?? 0,
    contentType: result.ContentType ?? undefined,
    metadata: result.Metadata ?? undefined,
  };
};

export const del = async (key: string): Promise<DeleteObjectCommandOutput> => {
  const { client, bucket } = ensureClient();

  return client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );
};

export const list = async (prefix?: string): Promise<ListObjectResult[]> => {
  const { client, bucket } = ensureClient();
  const results: ListObjectResult[] = [];
  let continuationToken: ListObjectsV2CommandOutput["NextContinuationToken"];

  do {
    const response = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      })
    );

    for (const object of response.Contents ?? []) {
      results.push({
        key: object.Key ?? "",
        size: Number(object.Size ?? 0),
        etag: object.ETag ?? undefined,
        lastModified: object.LastModified ?? undefined,
      });
    }

    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  return results;
};
