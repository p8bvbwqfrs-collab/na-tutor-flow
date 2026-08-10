import type { Metadata } from "next";

const siteName = "Tutor Flow";

type PublicMetadataInput = {
  title: string;
  description: string;
  path: `/${string}` | "/";
  type?: "website" | "article";
  absoluteTitle?: boolean;
};

export function createPublicMetadata({
  title,
  description,
  path,
  type = "website",
  absoluteTitle = false,
}: PublicMetadataInput): Metadata {
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      type,
      locale: "en_GB",
      siteName,
      title,
      description,
      url: path,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}
