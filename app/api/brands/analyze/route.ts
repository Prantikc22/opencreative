import { NextResponse } from "next/server";
import { z } from "zod";
import { apiContext, apiError } from "@/lib/api/context";
import { assertPublicHttpUrl } from "@/lib/security/guard";
import { creativeJson } from "@/lib/openrouter/client";
const schema = z.object({
  brandId: z.string().uuid(),
  website: z.string().url(),
});
const outputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    name: { type: "string" },
    industry: { type: "string" },
    description: { type: "string" },
    positioning: { type: "string" },
    targetAudience: { type: "string" },
    tone: { type: "array", items: { type: "string" }, maxItems: 6 },
    visualStyle: { type: "array", items: { type: "string" }, maxItems: 6 },
    colors: {
      type: "array",
      items: { type: "string", pattern: "^#[0-9A-Fa-f]{6}$" },
      maxItems: 8,
    },
    typography: {
      type: "object",
      additionalProperties: false,
      properties: { heading: { type: "string" }, body: { type: "string" } },
      required: ["heading", "body"],
    },
    preferredPhrases: { type: "array", items: { type: "string" }, maxItems: 8 },
    bannedPhrases: { type: "array", items: { type: "string" }, maxItems: 8 },
  },
  required: [
    "name",
    "industry",
    "description",
    "positioning",
    "targetAudience",
    "tone",
    "visualStyle",
    "colors",
    "typography",
    "preferredPhrases",
    "bannedPhrases",
  ],
};
function htmlToText(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .slice(0, 30000);
}
export async function POST(request: Request) {
  try {
    const context = await apiContext();
    const input = schema.parse(await request.json());
    const safe = await assertPublicHttpUrl(input.website);
    const response = await fetch(safe, {
      redirect: "manual",
      headers: { "User-Agent": "OpenCreative Brand Analyzer/1.0" },
      signal: AbortSignal.timeout(12000),
    });
    if (response.status >= 300 && response.status < 400)
      throw new Error("Website redirects must be reviewed before analysis.");
    if (!response.ok) throw new Error("We could not read that website.");
    const type = response.headers.get("content-type") || "";
    if (!type.includes("text/html"))
      throw new Error("That URL is not an HTML website.");
    const html = (await response.text()).slice(0, 500000);
    const text = htmlToText(html);
    const dna = await creativeJson<{
      name: string;
      industry: string;
      description: string;
      positioning: string;
      targetAudience: string;
      tone: string[];
      visualStyle: string[];
      colors: string[];
      typography: { heading: string; body: string };
      preferredPhrases: string[];
      bannedPhrases: string[];
    }>({
      system:
        "You analyze public website copy into a proposed Brand DNA. Use only evidence in the provided page text. When evidence is missing, write a conservative proposal and avoid factual claims. Hex colors may be inferred from visible brand cues only if present in text/style metadata. Return a concise editable profile.",
      prompt: `Website: ${safe.toString()}\nPage content:\n${text}`,
      schemaName: "brand_dna",
      schema: outputSchema,
    });
    const { error } = await context.supabase
      .from("brands")
      .update({
        name: dna.name,
        industry: dna.industry,
        description: dna.description,
        positioning: dna.positioning,
        target_audience: dna.targetAudience,
        tone: dna.tone,
        visual_style: dna.visualStyle,
        colors: dna.colors,
        typography: dna.typography,
        preferred_phrases: dna.preferredPhrases,
        banned_phrases: dna.bannedPhrases,
        source_metadata: {
          website: input.website,
          analyzedAt: new Date().toISOString(),
        },
        status: "active",
      })
      .eq("id", input.brandId)
      .eq("workspace_id", context.workspaceId);
    if (error) throw error;
    return NextResponse.json({ dna });
  } catch (cause) {
    const error = apiError(cause);
    return NextResponse.json(
      { error: error.message },
      { status: cause instanceof z.ZodError ? 400 : error.status },
    );
  }
}
