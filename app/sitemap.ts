import type { MetadataRoute } from "next";
import { productConfig } from "@/lib/config";

const routes = ["", "/pricing", "/compare", "/open-source", "/mcp", "/affiliates", "/support", "/privacy", "/terms", "/refund-policy", "/acceptable-use", "/solutions/marketing-teams", "/solutions/ecommerce", "/solutions/agencies", "/solutions/customer-support"];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((path, index) => ({
    url: `${productConfig.appUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: index === 0 ? "weekly" : "monthly",
    priority: index === 0 ? 1 : path === "/pricing" ? 0.9 : 0.7,
  }));
}
