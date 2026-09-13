import type { MetadataRoute } from "next";
import { productConfig } from "@/lib/config";
import { alternativePages, resourceArticles, SEO_REVIEW_DATE } from "@/lib/seo-content";

type SitemapEntry = {
  path: string;
  lastModified: string;
  changeFrequency: "weekly" | "monthly" | "yearly";
  priority: number;
};

const publicPages: SitemapEntry[] = [
  { path: "", lastModified: SEO_REVIEW_DATE, changeFrequency: "weekly", priority: 1 },
  { path: "/pricing", lastModified: SEO_REVIEW_DATE, changeFrequency: "monthly", priority: 0.9 },
  { path: "/alternatives", lastModified: SEO_REVIEW_DATE, changeFrequency: "monthly", priority: 0.9 },
  { path: "/resources", lastModified: SEO_REVIEW_DATE, changeFrequency: "weekly", priority: 0.9 },
  { path: "/compare", lastModified: SEO_REVIEW_DATE, changeFrequency: "monthly", priority: 0.8 },
  { path: "/open-source", lastModified: SEO_REVIEW_DATE, changeFrequency: "monthly", priority: 0.8 },
  { path: "/developers", lastModified: SEO_REVIEW_DATE, changeFrequency: "monthly", priority: 0.8 },
  { path: "/docs/api", lastModified: SEO_REVIEW_DATE, changeFrequency: "monthly", priority: 0.8 },
  { path: "/mcp", lastModified: SEO_REVIEW_DATE, changeFrequency: "monthly", priority: 0.8 },
  { path: "/affiliates", lastModified: SEO_REVIEW_DATE, changeFrequency: "monthly", priority: 0.6 },
  { path: "/support", lastModified: SEO_REVIEW_DATE, changeFrequency: "monthly", priority: 0.5 },
  { path: "/privacy", lastModified: SEO_REVIEW_DATE, changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", lastModified: "2026-09-11", changeFrequency: "yearly", priority: 0.3 },
  { path: "/refund-policy", lastModified: "2026-09-11", changeFrequency: "yearly", priority: 0.3 },
  { path: "/acceptable-use", lastModified: "2026-09-07", changeFrequency: "yearly", priority: 0.3 },
  { path: "/solutions/marketing", lastModified: SEO_REVIEW_DATE, changeFrequency: "monthly", priority: 0.8 },
  { path: "/solutions/ecommerce", lastModified: SEO_REVIEW_DATE, changeFrequency: "monthly", priority: 0.8 },
  { path: "/solutions/agencies", lastModified: SEO_REVIEW_DATE, changeFrequency: "monthly", priority: 0.8 },
  { path: "/solutions/customer-support", lastModified: SEO_REVIEW_DATE, changeFrequency: "monthly", priority: 0.8 },
  ...Object.keys(alternativePages).map((slug) => ({ path: `/alternatives/${slug}`, lastModified: SEO_REVIEW_DATE, changeFrequency: "monthly" as const, priority: 0.8 })),
  ...Object.keys(resourceArticles).map((slug) => ({ path: `/resources/${slug}`, lastModified: SEO_REVIEW_DATE, changeFrequency: "monthly" as const, priority: 0.8 })),
];

export default function sitemap(): MetadataRoute.Sitemap {
  return publicPages.map((page) => ({
    url: `${productConfig.appUrl}${page.path}`,
    lastModified: new Date(`${page.lastModified}T00:00:00.000Z`),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
    ...(page.path === "" ? {
      images: [
        `${productConfig.appUrl}/og.png`,
        `${productConfig.appUrl}/hero-imagination-warm.webp`,
      ],
    } : {}),
  }));
}
