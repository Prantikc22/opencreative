import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeDollarSign, ChartNoAxesCombined, Link2, MousePointerClick } from "lucide-react";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SupportAgentWidget } from "@/components/marketing/support-agent-widget";

export const metadata: Metadata = { title: "OpenCreative affiliate program", description: "Share OpenCreative with your audience and track referral clicks, conversions, and rewards." };

export default function AffiliatesPage() {
  return <main className="home-2026 affiliate-public">
    <MarketingNav />
    <section className="affiliate-hero">
      <p><BadgeDollarSign size={15} /> OPENCREATIVE AFFILIATES</p>
      <h1>Share the studio.<br /><em>Earn as it grows.</em></h1>
      <span>Recommend one creative workspace for image, video, voice, music, avatars, and agents. Your dashboard keeps the referral trail visible from first click to payout.</span>
      <div><Link className="oc-button oc-button-coral" href="/signup">Create an account <ArrowRight size={16} /></Link><Link className="oc-button oc-button-outline-light" href="/account/affiliate">Affiliate dashboard</Link></div>
    </section>
    <section className="affiliate-how">
      <header><p>ONE LINK. CLEAR NUMBERS.</p><h2>Simple enough to start today.</h2></header>
      <div>{[
        [Link2, "01", "Get your link", "Join from your workspace and receive a unique referral URL."],
        [MousePointerClick, "02", "Share naturally", "Add it to tutorials, reviews, newsletters, or your creator profile."],
        [ChartNoAxesCombined, "03", "Track the result", "See clicks, conversions, pending rewards, and paid earnings in one view."],
      ].map(([Icon, number, title, copy]) => <article key={String(title)}><Icon size={27} /><span>{String(number)}</span><h3>{String(title)}</h3><p>{String(copy)}</p></article>)}</div>
    </section>
    <section className="affiliate-rules"><div><p>BUILT FOR TRUST</p><h2>Useful recommendations win.</h2></div><aside><p>No misleading claims, self-referrals, cookie stuffing, or paid search on OpenCreative brand terms. Eligible conversions and reward rates appear in your dashboard when the commercial program opens.</p><Link href="/account/affiliate">Open your dashboard <ArrowRight size={15} /></Link></aside></section>
    <SiteFooter /><SupportAgentWidget />
  </main>;
}
