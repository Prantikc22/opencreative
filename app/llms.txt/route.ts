import { productConfig } from "@/lib/config";
import { alternativePages, resourceArticles } from "@/lib/seo-content";

export const dynamic = "force-static";

export function GET() {
  const base = productConfig.appUrl;
  const alternatives = Object.values(alternativePages)
    .map((page) => `- [OpenCreative vs ${page.competitor}](${base}/alternatives/${page.slug}): ${page.description}`)
    .join("\n");
  const resources = Object.values(resourceArticles)
    .map((article) => `- [${article.title}](${base}/resources/${article.slug}): ${article.description}`)
    .join("\n");
  const body = `# OpenCreative

> OpenCreative is an open-source AI creative studio for complete marketing campaigns. It connects image, video, ads, UGC, speech, transcription, translation, dubbing, avatars, assets, projects, and customer agents in one workspace.

## Official pages

- [Full product context for AI systems](${base}/llms-full.txt): Detailed product facts, use cases, comparisons, guides, and limitations.
- [Home](${base}/): Product overview and free signup.
- [Pricing](${base}/pricing): Creative and agent plans with usage estimates.
- [Open source and self-hosting](${base}/open-source): Architecture, license, setup, and deployment.
- [API documentation](${base}/docs/api): REST endpoints, authentication, errors, credits, and examples.
- [MCP server](${base}/mcp): Connect compatible AI agents to OpenCreative tools.
- [GitHub](https://github.com/Prantikc22/opencreative): MIT-licensed source code.

## Product comparisons

${alternatives}

## Practical resources

${resources}

## Important capability notes

- The core supports provider-backed image, video, avatar, speech, transcription, translation, dubbing, assets, projects, credits, agents, API, and MCP workflows.
- Music generation depends on available provider capacity.
- OpenCreative currently uses provider voices and does not create custom voice clones through OpenRouter's normalized speech endpoint.
- Open-source access covers the application core. Hosted AI models, database, object storage, email, billing, and deployment may have separate terms and costs.

## Policies and discovery

- [Privacy](${base}/privacy)
- [Acceptable use](${base}/acceptable-use)
- [Terms](${base}/terms)
- [Sitemap](${base}/sitemap.xml)
`;
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
