import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Minus } from "lucide-react";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SupportAgentWidget } from "@/components/marketing/support-agent-widget";

export const metadata: Metadata = { title: "Compare OpenCreative", description: "Compare OpenCreative with ElevenLabs, HeyGen, Runway, and Higgsfield across creative tools, agents, open source access, and pricing." };

const companies = [
  { name: "OpenCreative", price: "One account, broad workflow", focus: "Campaign operating system", href: "/pricing", note: "Create, organize, translate, deploy agents, and connect through MCP." },
  { name: "ElevenLabs", price: "Specialist platform", focus: "Voice and audio platform", href: "https://elevenlabs.io/pricing", note: "Best known for speech, dubbing, audio, and conversational agents." },
  { name: "HeyGen", price: "Specialist platform", focus: "Avatar video", href: "https://www.heygen.com/pricing", note: "Focused on presenter video and video translation workflows." },
  { name: "Runway", price: "Specialist platform", focus: "Generative video", href: "https://runwayml.com/pricing", note: "Focused on generative filmmaking and visual production." },
  { name: "Higgsfield", price: "Specialist platform", focus: "Image and video creation", href: "https://higgsfield.ai/pricing", note: "Focused on stylized image and video generation." },
] as const;

const rows = [
  ["AI image", true, true, false, true, true],
  ["AI video", true, true, true, true, true],
  ["Multilingual speech", true, true, true, true, true],
  ["Video translation", true, true, true, false, false],
  ["Avatar presenters", true, true, true, false, true],
  ["Original music", "Beta", true, false, false, true],
  ["Customer agents in the same workspace", true, true, false, false, false],
  ["Shared brand workspace", true, true, true, true, true],
  ["Open-source core", true, false, false, false, false],
  ["MCP creative tools", true, false, false, false, false],
  ["Full campaign builder", true, false, false, false, false],
  ["Reference-aware image workflow", true, true, false, true, true],
  ["UGC ad workflow", true, false, true, false, true],
  ["Product video workflow", true, false, true, true, true],
  ["Tenant support inbox", true, false, false, false, false],
  ["Affiliate dashboard", true, false, false, false, false],
  ["Credit estimate before generation", true, false, false, false, false],
  ["Products, brands, voices, and avatars as reusable identities", true, false, false, false, false],
  ["Shot-by-shot campaign planning", true, false, false, false, false],
  ["One ledger across image, video, voice, avatar, and agents", true, false, false, false, false],
] as const;

export default function ComparePage() {
  return <main className="home-2026 compare-public">
    <MarketingNav />
    <section className="compare-hero"><p>OPENCREATIVE VS THE TOOL STACK</p><h1>One workspace.<br /><em>Fewer handoffs.</em></h1><span>Specialist platforms can be excellent at one medium. OpenCreative is built for teams that want the image, film, voice, music, avatar, and agent to share the same brief and brand memory.</span><Link className="oc-button oc-button-coral" href="/signup">Start with 50 credits <ArrowRight size={16} /></Link></section>
    <section className="compare-prices"><header><p>PRODUCT POSITIONING</p><h2>Compare the operating model.</h2><span>OpenCreative replaces handoffs across a campaign. Specialist tools may go deeper in one medium; this comparison focuses on connected workflow breadth.</span></header><div>{companies.map((company, index) => <article className={index === 0 ? "featured" : ""} key={company.name}><span>{company.focus}</span><h3>{company.name}</h3><strong>{company.price}</strong><p>{company.note}</p>{company.href.startsWith("http") ? <a href={company.href} target="_blank" rel="noreferrer">Official site <ArrowRight size={14} /></a> : <Link href={company.href}>See plans <ArrowRight size={14} /></Link>}</article>)}</div></section>
    <section className="compare-matrix"><header><p>CAPABILITY MAP</p><h2>Choose around the workflow.</h2></header><div className="compare-table"><div className="compare-row compare-table-head"><strong>Capability</strong>{companies.map(c => <strong key={c.name}>{c.name}</strong>)}</div>{rows.map(([label, ...values]) => <div className="compare-row" key={String(label)}><strong>{String(label)}</strong>{values.map((value, index) => <span key={`${label}-${companies[index].name}`}>{value === true ? <Check size={18} /> : value === false ? <Minus size={18} /> : String(value)}</span>)}</div>)}</div><p className="compare-caveat">This is a product-scope comparison, not a claim that every feature is identical. Generation quality, limits, model availability, and included usage vary by plan and change over time.</p></section>
    <section className="compare-decision"><div><p>WHEN OPENCREATIVE FITS</p><h2>Keep the campaign together.</h2></div><aside><p>Choose OpenCreative when the expensive part is not one generation, but moving the same idea through six disconnected tools. Choose a specialist when one medium is the whole job.</p><Link className="oc-button oc-button-coral" href="/pricing">Compare OpenCreative plans <ArrowRight size={16} /></Link></aside></section>
    <SiteFooter /><SupportAgentWidget />
  </main>;
}
