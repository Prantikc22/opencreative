import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Coins } from "lucide-react";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SupportAgentWidget } from "@/components/marketing/support-agent-widget";
import { PricingExperience } from "@/components/pricing-experience";
export const metadata: Metadata = {
  title: "Pricing from $9/month",
  description: "Compare OpenCreative plans for creative production and customer agents, then estimate the right usage level.",
};
export default function Page() {
  return (
    <main className="home-2026 pricing-public">
      <MarketingNav />
      <section className="pricing-hero">
        <p className="eyebrow">
          <Coins size={13} />
          Plans from $9 / month
        </p>
        <h1>Choose the system.<br /><span>Pay for its pace.</span></h1>
        <p>
          Creative production and customer agents use different meters. Choose
          the workflow you need today and manage both from one OpenCreative account.
        </p>
        <nav className="pricing-jump-nav" aria-label="Pricing page sections">
          <a href="#plans">Plans</a><a href="#calculator">Calculator</a><a href="#compare">Plan comparison</a><a href="#pricing-faq">FAQ</a>
        </nav>
      </section>
      <PricingExperience />

      <section className="pricing-faq" id="pricing-faq">
        <header>
          <p className="eyebrow">Pricing, answered</p>
          <h2>Clear before you commit.</h2>
        </header>
        <div>
          {[
            ["Why start at $9?", "Most creators do not need a huge monthly generation allowance on day one. Starter covers regular image, voice and short-form video work, while top-ups handle unusually busy months."],
            ["What does one creative credit buy?", "Credits are model-weighted. Standard images start at 12 credits, five seconds of standard 720p video is about 200 credits, and premium models use more. OpenCreative shows the exact estimate before you generate."],
            ["Why are Agents separate?", "Agent conversations combine transcription, reasoning and speech synthesis continuously. Separate minute-based plans keep that cost transparent and stop agent traffic from draining a creative team’s generation credits."],
            ["Do failed generations use my credits?", "No. Credits are reserved when a job starts and returned automatically when the provider fails."],
            ["Can I start without a card?", "Yes. The Free plan includes 50 welcome credits and does not require a card."],
            ["Can I add credits without changing plans?", "Yes. One-off 250, 500 and 1,000-credit bundles are available from Credits & billing in the workspace."],
            ["How does annual billing work?", "Annual plans reduce the effective monthly price by 20%. The yearly total is shown directly on each plan before you choose it."],
            ["What is included in the $99 Studio plan?", "Studio includes 4,000 monthly credits, five workspace seats, shared brand systems, usage analytics and faster support for teams running multiple campaigns."],
            ["When should I choose Enterprise?", "Enterprise is for custom credit volumes, seat counts, SSO, advanced access controls, tailored provider policies and dedicated support."],
            ["Can I use my own provider accounts?", "Yes. OpenCreative supports bringing your own OpenRouter, Supabase and Cloudflare R2 accounts when you self-host the open-source core."],
          ].map(([question, answer], index) => (
            <details key={question} open={index === 0}>
              <summary>{question}<span>+</span></summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="pricing-cta">
        <p className="eyebrow">Start with the work, not a contract</p>
        <h2>Make the first thing free.<br /><em>Scale only when it earns it.</em></h2>
        <p>Start with 50 creative credits or 15 agent minutes. Choose only the product family you need.</p>
        <Link className="button button-coral" href="/signup">
          Start creating free <ArrowRight size={17} />
        </Link>
      </section>

      <SupportAgentWidget />
      <SiteFooter />
    </main>
  );
}
