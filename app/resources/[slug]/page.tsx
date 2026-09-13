import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SupportAgentWidget } from "@/components/marketing/support-agent-widget";
import { resourceArticles, SEO_REVIEW_DATE } from "@/lib/seo-content";
import { absoluteUrl, marketingMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return Object.keys(resourceArticles).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = resourceArticles[slug];
  if (!article) return {};
  return marketingMetadata({ title: article.metaTitle, description: article.description, path: `/resources/${article.slug}` });
}

export default async function ResourcePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = resourceArticles[slug];
  if (!article) notFound();
  const url = absoluteUrl(`/resources/${article.slug}`);
  const related = Object.values(resourceArticles).filter((item) => item.slug !== article.slug).slice(0, 2);
  return (
    <main className="seo-public">
      <JsonLd data={[
        { "@context": "https://schema.org", "@type": "Article", headline: article.title, description: article.description, url, datePublished: SEO_REVIEW_DATE, dateModified: SEO_REVIEW_DATE, author: { "@type": "Organization", name: "OpenCreative", url: absoluteUrl("/") }, publisher: { "@type": "Organization", name: "OpenCreative", url: absoluteUrl("/") } },
        { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") }, { "@type": "ListItem", position: 2, name: "Resources", item: absoluteUrl("/resources") }, { "@type": "ListItem", position: 3, name: article.title, item: url }] },
        { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: article.faq.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) },
      ]} />
      <MarketingNav />
      <section className="seo-hero">
        <nav className="seo-breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/resources">Resources</Link><span>/</span><span>{article.kicker}</span></nav>
        <p className="seo-kicker">{article.kicker} · {article.readTime}</p>
        <h1>{article.title}</h1>
        <p>{article.intro}</p>
      </section>
      <article className="seo-article">
        <div className="seo-article-main">
          {article.sections.map((section) => <section key={section.heading}><h2>{section.heading}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{section.bullets && <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}</section>)}
          <section className="seo-faq"><h2>Frequently asked questions</h2>{article.faq.map((item) => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</section>
        </div>
        <aside className="seo-aside"><span>PUT IT INTO PRACTICE</span><h2>Keep the campaign connected.</h2><p>Start with one brief, then move through the creative formats your launch actually needs.</p><Link className="oc-button oc-button-coral" href="/signup">Start free <ArrowRight size={15} /></Link><Link href="/alternatives">Compare platforms <ArrowRight size={13} /></Link></aside>
      </article>
      <section className="seo-related"><header><p className="seo-kicker">READ NEXT</p><h2>More practical guides</h2></header><div className="seo-card-grid">{related.map((item) => <article className="seo-card" key={item.slug}><span>{item.kicker}</span><h3>{item.title}</h3><p>{item.description}</p><Link href={`/resources/${item.slug}`}>Read guide <ArrowRight size={15} /></Link></article>)}</div></section>
      <SiteFooter />
      <SupportAgentWidget />
    </main>
  );
}
