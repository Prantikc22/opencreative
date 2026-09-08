import Link from "next/link";
import { ArrowRight, FileJson } from "lucide-react";
import { ApiReference } from "@/components/api-reference";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SupportAgentWidget } from "@/components/marketing/support-agent-widget";

export const metadata = {
  title: "API Documentation",
  description: "Human-readable OpenCreative API documentation for image, video, speech, music, avatar, and transcription workflows.",
};

export default function ApiDocsPage() {
  return (
    <main className="api-docs-public">
      <MarketingNav />
      <section className="api-docs-hero">
        <div><p className="section-kicker">DEVELOPER DOCUMENTATION · V1</p><h1>Build with<br /><em>OpenCreative.</em></h1><p>A practical reference for generating images, video, speech, music, avatars, and transcripts with one key.</p></div>
        <div className="api-docs-hero-actions"><Link className="oc-button oc-button-coral" href="/login?next=/account/mcp">Get an API key <ArrowRight size={16} /></Link><a className="oc-button oc-button-outline-light" href="/api/v1/openapi.json">OpenAPI JSON <FileJson size={16} /></a></div>
      </section>
      <ApiReference />
      <SiteFooter />
      <SupportAgentWidget />
    </main>
  );
}
