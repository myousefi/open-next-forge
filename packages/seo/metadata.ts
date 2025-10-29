import merge from "lodash.merge";
import type { Metadata } from "next";

type MetadataGenerator = Omit<Metadata, "description" | "title"> & {
  title: string;
  description: string;
  image?: string;
};

const applicationName = "next-forge";
const author: Metadata["authors"] = {
  name: "Vercel",
  url: "https://vercel.com/",
};
const publisher = "Vercel";
const twitterHandle = "@vercel";
const fallbackWebOrigin = process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3001";
const resolvedWebOrigin = process.env.WEB_ORIGIN ?? fallbackWebOrigin;

const resolveUrl = (value?: string) => {
  if (!value) {
    return undefined;
  }

  try {
    return new URL(value);
  } catch {
    return undefined;
  }
};

const metadataBase = resolveUrl(resolvedWebOrigin) ?? resolveUrl(fallbackWebOrigin);
const metadataBaseHostname = metadataBase?.hostname;
const metadataBaseString = metadataBase?.toString();

export const createMetadata = ({
  title,
  description,
  image,
  ...properties
}: MetadataGenerator): Metadata => {
  const parsedTitle = `${title} | ${applicationName}`;
  const defaultMetadata: Metadata = {
    title: parsedTitle,
    description,
    applicationName,
    metadataBase,
    authors: [author],
    creator: author.name,
    formatDetection: {
      telephone: false,
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: parsedTitle,
    },
    openGraph: {
      title: parsedTitle,
      description,
      type: "website",
      siteName: applicationName,
      locale: "en_US",
      url: metadataBaseString,
    },
    publisher,
    twitter: {
      card: "summary_large_image",
      creator: twitterHandle,
      ...(metadataBaseHostname ? { site: metadataBaseHostname } : {}),
    },
  };

  const metadata: Metadata = merge(defaultMetadata, properties);

  if (image && metadata.openGraph) {
    const imageUrl = metadataBase ? new URL(image, metadataBase).toString() : image;

    metadata.openGraph.images = [
      {
        url: imageUrl,
        width: 1200,
        height: 630,
        alt: title,
      },
    ];

    if (metadata.twitter) {
      metadata.twitter.images = [imageUrl];
    }
  }

  return metadata;
};
