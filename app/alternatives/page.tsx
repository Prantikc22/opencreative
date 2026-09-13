import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SupportAgentWidget } from "@/components/marketing/support-agent-widget";
import { alternativePages, SEO_REVIEW_DATE } from "@/lib/seo-content";
import { absoluteUrl, marketingMetadata } from "@/lib/seo";

export const metadata: Metadata = marketingMetadata({
  title: "AI creative platform alternatives",
  description: "Honest comparisons of OpenCreative with ElevenLabs, HeyGen, Higgsfield, and Runway for voice, video, avatars, open-source access, and complete campaigns.",
  path: "/alternatives",
  keywords: ["AI creative platform alternatives", "open source AI studio", "AI marketing tools comparison"],
});

export default function AlternativesPage() {
  const pages = Object.values(alternativePages);
  return (
    <main className="seo-public">
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "AI creative platform alternatives",
        description: metadata.description,
        url: absoluteUrl("/alternatives"),
        dateModified: SEO_REVIEW_DATE,
        mainEntity: {
          "@type": "ItemList",
          itemListElement: pages.map((page, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: page.title,
            url: absoluteUrl(`/alternatives/${page.slug}`),
          })),
        },
      }} />
      <MarketingNav />
      <section className="seo-hero">
        <p className="seo-kicker">HONEST PRODUCT COMPARISONS</p>
        <h1>Choose the workflow, not the loudest feature list.</h1>
        <p>Compare specialist AI products with an open-source creative workspace. Each guide explains where OpenCreative fits, where the specialist remains stronger, and what to test before deciding.</p>
        <div className="seo-hero-actions"><Link className="oc-button oc-button-coral" href="/signup">Try OpenCreative free <ArrowRight size={16} /></Link></div>
      </section>
      <section className="seo-index">
        <header><p className="seo-kicker">COMPARISON LIBRARY</p><h2>Start with your bottleneck.</h2><p>Voice depth, avatar speed, visual experimentation, or cross-format campaign continuity each point to a different choice.</p></header>
        <div className="seo-card-grid">
          {pages.map((page) => (
            <article className="seo-card" key={page.slug}>
              <span>OPENCREATIVE VS {page.competitor.toUpperCase()}</span>
              <h2>{page.competitor} alternative</h2>
              <p>{page.quickAnswer}</p>
              <Link href={`/alternatives/${page.slug}`}>Read the comparison <ArrowRight size={15} /></Link>
            </article>
          ))}
        </div>
      </section>
      <SiteFooter />
      <SupportAgentWidget />
    </main>
  );
}
