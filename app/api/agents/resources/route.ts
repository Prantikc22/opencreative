import { NextResponse } from "next/server";
import { extractText } from "unpdf";
import { apiContext, apiError } from "@/lib/api/context";
import { assertPublicHttpUrl } from "@/lib/security/guard";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_FILE_BYTES = 8 * 1024 * 1024;
const MAX_PAGE_BYTES = 2 * 1024 * 1024;
const MAX_TEXT_CHARS = 12_000;

function cleanText(value: string) {
  return value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_TEXT_CHARS);
}

function pageLinks(html: string, base: URL) {
  const links: string[] = [];
  for (const match of html.matchAll(/<a\b[^>]*?href=["']([^"']+)["']/gi)) {
    try {
      const next = new URL(match[1], base);
      next.hash = "";
      if (next.origin !== base.origin || !["http:", "https:"].includes(next.protocol)) continue;
      if (/\.(?:pdf|jpe?g|png|gif|webp|svg|zip|mp[34]|mov|avi)$/i.test(next.pathname)) continue;
      if (/(?:\/|^)(?:login|logout|sign-in|signup|cart|checkout|admin)(?:\/|$)/i.test(next.pathname)) continue;
      links.push(next.toString());
    } catch { /* Ignore invalid links in third-party HTML. */ }
  }
  return [...new Set(links)];
}

async function fetchPublicPage(input: string) {
  let url = await assertPublicHttpUrl(input);
  for (let redirects = 0; redirects <= 3; redirects += 1) {
    const response = await fetch(url, {
      redirect: "manual",
      headers: { "User-Agent": "OpenCreative-Knowledge-Importer/1.0" },
      signal: AbortSignal.timeout(10_000),
    });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) throw new Error("The website returned an invalid redirect.");
      url = await assertPublicHttpUrl(new URL(location, url).toString());
      continue;
    }
    if (!response.ok) throw new Error(`The website returned ${response.status}.`);
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html") && !contentType.includes("text/plain")) {
      throw new Error("That URL is not a readable web page.");
    }
    const contentLength = Number(response.headers.get("content-length") || 0);
    if (contentLength > MAX_PAGE_BYTES) throw new Error("That page is too large to import.");
    const bytes = await response.arrayBuffer();
    if (bytes.byteLength > MAX_PAGE_BYTES) throw new Error("That page is too large to import.");
    const body = new TextDecoder().decode(bytes);
    return { url: url.toString(), text: cleanText(body), links: contentType.includes("text/html") ? pageLinks(body, url) : [] };
  }
  throw new Error("The website redirected too many times.");
}

async function crawlPublicSite(input: string) {
  const seed = await assertPublicHttpUrl(input);
  const queue = [seed.toString()];
  const visited = new Set<string>();
  const pages: Array<{ url: string; text: string }> = [];
  while (queue.length && pages.length < 8) {
    const next = queue.shift()!;
    if (visited.has(next)) continue;
    visited.add(next);
    try {
      const page = await fetchPublicPage(next);
      if (new URL(page.url).origin !== seed.origin) continue;
      if (page.text.length >= 40) pages.push({ url: page.url, text: page.text });
      for (const link of page.links) if (!visited.has(link) && queue.length < 40) queue.push(link);
    } catch (cause) {
      if (!pages.length) throw cause;
    }
  }
  const text = pages.map((page) => `Page: ${page.url}\n${page.text}`).join("\n\n").slice(0, MAX_TEXT_CHARS);
  return { url: seed.toString(), text, pages: pages.length };
}

export async function POST(request: Request) {
  try {
    await apiContext("agents");
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("file");
      if (!(file instanceof File)) throw new Error("Choose a PDF to import.");
      if (file.size > MAX_FILE_BYTES) throw new Error("PDFs must be smaller than 8 MB.");
      if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
        throw new Error("Only PDF resources are supported.");
      }
      const result = await extractText(new Uint8Array(await file.arrayBuffer()), { mergePages: true });
      const text = cleanText(Array.isArray(result.text) ? result.text.join("\n") : result.text);
      if (text.length < 40) throw new Error("No readable text was found in that PDF.");
      return NextResponse.json({
        resource: { id: crypto.randomUUID(), name: file.name.slice(0, 100), type: "pdf", source: file.name.slice(0, 100), text },
      });
    }

    const body = await request.json() as { url?: string };
    if (!body.url) throw new Error("Enter a website URL to import.");
    const page = await crawlPublicSite(body.url);
    if (page.text.length < 40) throw new Error("No readable text was found on that website.");
    return NextResponse.json({
      resource: { id: crypto.randomUUID(), name: `${new URL(page.url).hostname} (${page.pages} pages)`, type: "website", source: page.url, text: page.text },
    });
  } catch (cause) {
    const error = apiError(cause);
    return NextResponse.json({ error: error.message }, { status: error.status === 500 ? 400 : error.status });
  }
}
