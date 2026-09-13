import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, ExternalLink } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SupportAgentWidget } from "@/components/marketing/support-agent-widget";
import { alternativePages, SEO_REVIEW_DATE } from "@/lib/seo-content";
import { absoluteUrl, marketingMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return Object.keys(alternativePages).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = alternativePages[slug];
  if (!page) return {};
  return marketingMetadata({
    title: page.metaTitle,
    description: page.description,
    path: `/alternatives/${page.slug}`,
    keywords: [`${page.competitor} alternative`, `open source ${page.competitor} alternative`, "AI creative studio"],
  });
}

export default async function AlternativePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = alternativePages[slug];
  if (!page) notFound();
  const url = absoluteUrl(`/alternatives/${page.slug}`);
  const related = Object.values(alternativePages).filter((item) => item.slug !== page.slug).slice(0, 2);
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: page.title,
      description: page.description,
      url,
      datePublished: SEO_REVIEW_DATE,
      dateModified: SEO_REVIEW_DATE,
      author: { "@type": "Organization", name: "OpenCreative", url: absoluteUrl("/") },
      publisher: { "@type": "Organization", name: "OpenCreative", url: absoluteUrl("/") },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "Alternatives", item: absoluteUrl("/alternatives") },
        { "@type": "ListItem", position: 3, name: page.competitor, item: url },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: page.faq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    },
  ];

  return (
    <main className="seo-public">
      <JsonLd data={structuredData} />
      <MarketingNav />
      <section className="seo-hero">
        <nav className="seo-breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/alternatives">Alternatives</Link><span>/</span><span>{page.competitor}</span></nav>
        <p className="seo-kicker">OPENCREATIVE VS {page.competitor.toUpperCase()}</p>
        <h1>{page.title}</h1>
        <p>{page.intro}</p>
        <div className="seo-hero-actions"><Link className="oc-button oc-button-coral" href="/signup">Start free <ArrowRight size={16} /></Link></div>
      </section>

      <article className="seo-article">
        <div className="seo-article-main">
          <div className="seo-quick-answer"><strong>Short answer</strong><p>{page.quickAnswer}</p></div>
          <section>
            <h2>Which product fits which job?</h2>
            <h3>Choose OpenCreative when you need</h3>
            <ul>{page.openCreativeFit.map((item) => <li key={item}>{item}</li>)}</ul>
            <h3>Choose {page.competitor} when you need</h3>
            <ul>{page.specialistFit.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>
          {page.sections.map((section) => <section key={section.heading}><h2>{section.heading}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{section.bullets && <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}</section>)}
          <section className="seo-faq"><h2>Frequently asked questions</h2>{page.faq.map((item) => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</section>
          <section className="seo-disclosure"><p><strong>Disclosure:</strong> This comparison is published by OpenCreative and was reviewed on September 13, 2026. Competitor capabilities can change. Verify current details on the <a href={page.officialUrl} target="_blank" rel="noreferrer">official {page.competitor} site</a>.</p></section>
        </div>
        <aside className="seo-aside">
          <span>OPENCREATIVE AT A GLANCE</span>
          <h2>One brief across the campaign.</h2>
          <p>Connect image, video, speech, avatars, localization, assets, and agents in an open-source workspace.</p>
          <ul>{page.openCreativeFit.slice(0, 4).map((item) => <li key={item}><Check size={14} aria-hidden="true" /> {item}</li>)}</ul>
          <Link className="oc-button oc-button-coral" href="/pricing">See plans <ArrowRight size={15} /></Link>
          <a href={page.officialUrl} target="_blank" rel="noreferrer">Visit {page.competitor} <ExternalLink size={13} /></a>
        </aside>
      </article>

      <section className="seo-related">
        <header><p className="seo-kicker">KEEP COMPARING</p><h2>Related alternatives</h2></header>
        <div className="seo-card-grid">{related.map((item) => <article className="seo-card" key={item.slug}><span>PRODUCT COMPARISON</span><h3>OpenCreative vs {item.competitor}</h3><p>{item.quickAnswer}</p><Link href={`/alternatives/${item.slug}`}>Read guide <ArrowRight size={15} /></Link></article>)}</div>
      </section>
      <SiteFooter />
      <SupportAgentWidget />
    </main>
  );
}
