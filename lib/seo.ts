import type { Metadata } from "next";
import { productConfig } from "@/lib/config";

type MarketingMetadataOptions = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
};

export function absoluteUrl(path = "/") {
  return new URL(path, `${productConfig.appUrl}/`).toString();
}

export function marketingMetadata({
  title,
  description,
  path,
  keywords,
}: MarketingMetadataOptions): Metadata {
  const url = absoluteUrl(path);
  return {
    title,
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: productConfig.name,
      locale: "en_US",
      type: "website",
      images: [{
        url: absoluteUrl("/og.png"),
        width: 1734,
        height: 907,
        alt: `${productConfig.name}, the open-source AI creative studio`,
      }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteUrl("/og.png")],
    },
  };
}

export function jsonLdString(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
