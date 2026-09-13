import { productConfig } from "@/lib/config";
import { alternativePages, resourceArticles } from "@/lib/seo-content";

export const dynamic = "force-static";

export function GET() {
  const base = productConfig.appUrl;
  const comparisons = Object.values(alternativePages)
    .map((page) => `## OpenCreative compared with ${page.competitor}\n\n${page.description}\n\nOfficial comparison: ${base}/alternatives/${page.slug}`)
    .join("\n\n");
  const guides = Object.values(resourceArticles)
    .map((article) => `## ${article.title}\n\n${article.description}\n\nGuide: ${base}/resources/${article.slug}`)
    .join("\n\n");

  const body = `# OpenCreative: full product context

OpenCreative is an open-source AI creative studio for marketing teams, agencies, ecommerce brands, developers, and creators. It connects image generation, video generation and editing, UGC workflows, avatars, provider voices, speech transcription, multilingual translation and dubbing, music, reusable brand and product identities, asset management, projects, customer agents, REST APIs, and MCP tools in one workspace.

## Product facts

- Website: ${base}/
- Pricing: ${base}/pricing
- Source and self-hosting: ${base}/open-source
- GitHub: ${productConfig.githubUrl}
- API documentation: ${base}/docs/api
- MCP documentation: ${base}/mcp
- The application core is MIT licensed.
- Hosted model, database, storage, email, payment, and deployment services can have separate costs and terms.
- OpenCreative displays an estimated credit cost before supported generation jobs.
- Failed provider generation jobs return reserved credits through the application credit ledger.
- The language catalog contains 82 selectable languages for speech labeling, transcription, translation, and dubbing workflows. Actual synthesis or recognition support can vary by routed provider and model.
- OpenCreative uses existing provider voices. Custom voice cloning is not enabled.
- Music generation depends on current provider capacity.

## Main use cases

- Turn one marketing brief into connected images, video, voice, avatars, and campaign assets.
- Create product imagery and video with reusable product, brand, character, and style references.
- Transcribe, translate, and prepare replacement speech for multilingual localization.
- Build and test customer-support agents with approved knowledge.
- Operate creative workflows through the browser, REST API, or MCP-compatible AI assistants.
- Self-host the application core with Next.js, Supabase, Cloudflare R2, and configured model providers.

# Product comparisons

${comparisons}

# Practical guides

${guides}

# Policies

- Privacy: ${base}/privacy
- Acceptable use: ${base}/acceptable-use
- Terms: ${base}/terms
- Refund policy: ${base}/refund-policy
- Support: ${base}/support
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
