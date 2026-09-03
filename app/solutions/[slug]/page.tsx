import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, AudioLines, Bot, Clapperboard, ImageIcon, Music2, ScanFace, Sparkles } from "lucide-react";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { SiteFooter } from "@/components/marketing/site-footer";

const solutions = {
  marketing: {
    eyebrow: "FOR MARKETING TEAMS",
    title: "One brief becomes the entire launch.",
    copy: "Move from product truth to campaign film, stills, presenter, voice, music, and support without rebuilding the context six times.",
    outcome: "Launch faster with one coherent campaign world.",
    metrics: [["01", "Living brief"], ["06", "Connected studios"], ["01", "Approval trail"]],
    brief: "Launch a new product across film, paid social, retail, and support in three markets.",
    deliverables: ["Campaign film", "Paid social variants", "Localized voice", "Launch support guide"],
  },
  ecommerce: {
    eyebrow: "FOR ECOMMERCE",
    title: "Every product gets a full creative system.",
    copy: "Turn a catalog item into premium photography, performance video, creator variants, localized voice, and an agent that can answer customer questions.",
    outcome: "More creative range from every product page.",
    metrics: [["01", "Catalog source"], ["05", "Creative formats"], ["24/7", "Product guide"]],
    brief: "Turn a single product record into the imagery, video, UGC, and answers needed to sell it.",
    deliverables: ["Product photography", "Performance ads", "Creator scripts", "Customer agent"],
  },
  agencies: {
    eyebrow: "FOR AGENCIES",
    title: "More client work. Less production drag.",
    copy: "Keep Brand DNA, references, approvals, model choices, and finished assets attached to one living brief across every account.",
    outcome: "Protect the idea while increasing production volume.",
    metrics: [["01", "Client memory"], ["06", "Production modes"], ["∞", "Reusable systems"]],
    brief: "Carry the approved client world from pitch through production without rebuilding context.",
    deliverables: ["Pitch concepts", "Production boards", "Client variants", "Final campaign kit"],
  },
  "customer-support": {
    eyebrow: "FOR CUSTOMER SUPPORT",
    title: "Give product knowledge a natural voice.",
    copy: "Build a voice-first agent that works from any phone or laptop, speaks only from approved company knowledge, and can sit inside your support widget.",
    outcome: "Answer quickly without losing trust or context.",
    metrics: [["03", "Provider stages"], ["70+", "Languages"], ["01", "Approved knowledge base"]],
    brief: "Create a voice and text agent that understands the product, knows its limits, and hands off cleanly.",
    deliverables: ["Voice intake", "Grounded answer", "Spoken response", "Conversation record"],
  },
} as const;

const productFlow = [
  [ImageIcon, "Image", "Campaign stills and product scenes"],
  [Clapperboard, "Video", "Launch films and social cuts"],
  [AudioLines, "Voice", "Narration and localization"],
  [Music2, "Music", "An original campaign score"],
  [ScanFace, "Avatar", "A repeatable presenter"],
  [Bot, "Agent", "A guide grounded in the product"],
] as const;

export function generateStaticParams() {
  return Object.keys(solutions).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const solution = solutions[slug as keyof typeof solutions];
  return solution ? { title: solution.eyebrow.replace("FOR ", "") } : {};
}

export default async function SolutionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const solution = solutions[slug as keyof typeof solutions];
  if (!solution) notFound();

  return (
    <main className="marketing-shell home-2026 solution-page">
      <MarketingNav />
      <section className="solution-hero"><div><p><Sparkles size={15} /> {solution.eyebrow}</p><h1>{solution.title}</h1><span>{solution.copy}</span><div><Link className="oc-button oc-button-coral" href="/signup">Start creating <ArrowRight size={16} /></Link><Link className="oc-button oc-button-outline-light" href="/pricing">See pricing</Link></div></div></section>
      <section className="solution-flow"><header><p>ONE CONNECTED WORKFLOW</p><h2>{solution.outcome}</h2></header><div>{productFlow.map(([Icon, name, copy], index) => <article key={name}><span>0{index + 1}</span><Icon size={26} /><h3>{name}</h3><p>{copy}</p></article>)}</div></section>
      <section className="solution-proof"><div>{solution.metrics.map(([value, label]) => <article key={label}><strong>{value}</strong><span>{label}</span></article>)}</div><p>Every output keeps the workspace, brief, model choice, generation record, and finished asset connected.</p></section>
      <section className="solution-workbench">
        <div className="solution-brief-card"><span>THE WORK STARTS HERE</span><h2>{solution.brief}</h2><small>Brand memory, references, audience, market, and budget stay attached.</small></div>
        <div className="solution-route-card"><header><Sparkles size={18} /><span>OPENCREATIVE ROUTER</span></header><strong>Intent in.<br />Finished work out.</strong><div>{["Brand DNA", "Format", "Quality", "Budget"].map((item) => <span key={item}>{item}</span>)}</div><small>Models are selected per asset, not forced across the campaign.</small></div>
        <div className="solution-output-card"><span>DELIVERABLES</span>{solution.deliverables.map((item, index) => <div key={item}><small>0{index + 1}</small><strong>{item}</strong><ArrowRight size={15} /></div>)}</div>
      </section>
      <section className="solution-cta"><p>START WITH THE OUTCOME</p><h2>Direct the work.<br /><em>Keep the whole campaign.</em></h2><Link className="oc-button oc-button-coral" href="/signup">Build your first campaign <ArrowRight size={16} /></Link></section>
      <SiteFooter />
    </main>
  );
}
