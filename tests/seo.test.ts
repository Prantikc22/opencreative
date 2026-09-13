import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { GET as getLlmsTxt } from "@/app/llms.txt/route";
import { alternativePages, resourceArticles } from "@/lib/seo-content";
import { marketingMetadata } from "@/lib/seo";

describe("public search surfaces", () => {
  it("publishes a unique, public-only sitemap with every editorial page", () => {
    const entries = sitemap();
    const urls = entries.map((entry) => entry.url);
    expect(new Set(urls).size).toBe(urls.length);
    expect(urls.every((url) => url.startsWith("http"))).toBe(true);
    expect(urls.some((url) => /\/(app|account|studio|create|workspace|onboarding)(\/|$)/.test(new URL(url).pathname))).toBe(false);

    for (const slug of Object.keys(alternativePages)) {
      expect(urls.some((url) => new URL(url).pathname === `/alternatives/${slug}`)).toBe(true);
    }
    for (const slug of Object.keys(resourceArticles)) {
      expect(urls.some((url) => new URL(url).pathname === `/resources/${slug}`)).toBe(true);
    }
  });

  it("uses stable, valid modification dates", () => {
    for (const entry of sitemap()) {
      expect(entry.lastModified).toBeInstanceOf(Date);
      expect(Number.isNaN(new Date(entry.lastModified!).getTime())).toBe(false);
    }
  });

  it("serves llms.txt with the official pages, limitations, and all guides", async () => {
    const response = getLlmsTxt();
    const body = await response.text();
    expect(response.headers.get("content-type")).toContain("text/plain");
    expect(body).toContain("# OpenCreative");
    expect(body).toContain("does not create custom voice clones");
    for (const page of Object.values(alternativePages)) expect(body).toContain(`/alternatives/${page.slug}`);
    for (const article of Object.values(resourceArticles)) expect(body).toContain(`/resources/${article.slug}`);
  });

  it("builds canonical and social metadata together", () => {
    const metadata = marketingMetadata({ title: "Example", description: "Example page", path: "/example" });
    expect(metadata.alternates?.canonical).toMatch(/\/example$/);
    expect(metadata.openGraph?.title).toBe("Example");
    expect(metadata.twitter).toMatchObject({ card: "summary_large_image" });
  });
});
