import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SupportAgentWidget } from "@/components/marketing/support-agent-widget";
import { resourceArticles, SEO_REVIEW_DATE } from "@/lib/seo-content";
import { absoluteUrl, marketingMetadata } from "@/lib/seo";

export const metadata: Metadata = marketingMetadata({
  title: "AI creative production resources",
  description: "Practical guides for AI campaign production, video localization, open-source creative studios, workflow design, model routing, and platform selection.",
  path: "/resources",
  keywords: ["AI creative workflow", "AI marketing resources", "open source creative studio"],
});

export default function ResourcesPage() {
  const articles = Object.values(resourceArticles);
  return (
    <main className="seo-public">
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "OpenCreative resources",
        description: metadata.description,
        url: absoluteUrl("/resources"),
        dateModified: SEO_REVIEW_DATE,
        mainEntity: { "@type": "ItemList", itemListElement: articles.map((article, index) => ({ "@type": "ListItem", position: index + 1, name: article.title, url: absoluteUrl(`/resources/${article.slug}`) })) },
      }} />
      <MarketingNav />
      <section className="seo-hero">
        <p className="seo-kicker">OPENCREATIVE RESOURCES</p>
        <h1>Better creative systems make better work.</h1>
        <p>Practical, plain-language guides to building AI campaigns, localizing video, evaluating platforms, and owning the application layer around your models.</p>
      </section>
      <section className="seo-index">
        <header><p className="seo-kicker">FIELD GUIDES</p><h2>From model demo to production workflow.</h2><p>Every guide is written around a task a creative or technical team can actually complete.</p></header>
        <div className="seo-card-grid">
          {articles.map((article) => <article className="seo-card" key={article.slug}><span>{article.kicker} · {article.readTime}</span><h2>{article.title}</h2><p>{article.description}</p><Link href={`/resources/${article.slug}`}>Read the guide <ArrowRight size={15} /></Link></article>)}
        </div>
      </section>
      <SiteFooter />
      <SupportAgentWidget />
    </main>
  );
}
