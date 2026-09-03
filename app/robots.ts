import type { MetadataRoute } from "next";
import { productConfig } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/app", "/account/", "/studio/", "/create/", "/workspace/", "/identities/", "/api/"] },
    sitemap: `${productConfig.appUrl}/sitemap.xml`,
    host: productConfig.appUrl,
  };
}
