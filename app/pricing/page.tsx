import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Coins, Sparkles } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { SiteFooter } from "@/components/marketing/site-footer";
import { PricingCalculator } from "@/components/pricing-calculator";
import { PricingTable } from "@/components/pricing-table";
import { pricingPlans } from "@/lib/pricing";
export const metadata: Metadata = {
  title: "Pricing from $9/month",
  description: "Start free, then scale from $9/month. Compare OpenCreative plans and estimate the right credit budget for your image, video, voice and avatar work.",
};
export default function Page() {
  return (
    <main className="pricing-public">
      <header className="site-header">
        <Link href="/">
          <BrandMark />
        </Link>
        <nav className="site-nav">
          <Link href="/#workflows">Create</Link>
          <Link href="/#brand-memory">Identities</Link>
          <Link href="/#open-source">Open source</Link>
          <a href="#calculator">Calculator</a>
        </nav>
        <div className="site-actions">
          <Link className="text-button" href="/login">
            Sign in
          </Link>
          <Link className="button button-coral button-compact" href="/signup">
            Start creating
          </Link>
        </div>
      </header>
      <section className="pricing-hero">
        <p className="eyebrow">
          <Coins size={13} />
          Plans from $9 / month
        </p>
        <h1>All the studio.<br /><span>Less subscription.</span></h1>
        <p>
          Start free, then pay for the pace you actually create at. No $79 jump,
          no feature maze, and no card required to make your first project.
        </p>
      </section>
      <PricingTable />
      <div className="pricing-assurance" aria-label="Pricing assurances">
        <span><Check size={16} /> No card to start</span>
        <span><Check size={16} /> See the cost before generating</span>
        <span><Check size={16} /> Failed jobs refund automatically</span>
        <span><Check size={16} /> Top up without changing plans</span>
      </div>
      <PricingCalculator />

      <section className="pricing-comparison" id="compare">
        <header>
          <p className="eyebrow"><Sparkles size={14} /> Compare plans</p>
          <h2>See exactly what changes as you grow.</h2>
          <p>No vague “more features” language. The useful differences are here.</p>
        </header>
        <div className="comparison-scroll">
          <table>
            <thead>
              <tr>
                <th>Capability</th>
                {pricingPlans.map((plan) => <th key={plan.id}>{plan.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {[
                ["Monthly credits", "50 welcome", "250", "750", "2,000"],
                ["Image, video and voice studios", true, true, true, true],
                ["Avatar studio", true, true, true, true],
                ["Projects and asset library", true, true, true, true],
                ["Watermark-free commercial exports", false, true, true, true],
                ["Brand, product and avatar identities", false, false, true, true],
                ["UGC and product-video workflows", false, false, true, true],
                ["Premium quality tiers", false, false, false, true],
                ["Priority generation routing", false, false, false, true],
                ["Support", "Community", "Standard", "Email", "Priority"],
              ].map(([label, ...values]) => (
                <tr key={String(label)}>
                  <th>{label}</th>
                  {values.map((value, index) => (
                    <td key={`${label}-${index}`}>
                      {typeof value === "boolean" ? (
                        value ? <Check size={18} aria-label="Included" /> : <span aria-label="Not included">—</span>
                      ) : value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="pricing-faq">
        <header>
          <p className="eyebrow">Pricing, answered</p>
          <h2>Clear before you commit.</h2>
        </header>
        <div>
          {[
            ["Why start at $9?", "Most creators do not need a huge monthly generation allowance on day one. Starter covers regular image, voice and short-form video work, while top-ups handle unusually busy months."],
            ["What does one credit buy?", "It depends on the model and format. An image can start at a few credits; video varies by duration and quality. OpenCreative shows the exact estimate before you generate."],
            ["Do failed generations use my credits?", "No. Credits are reserved when a job starts and returned automatically when the provider fails."],
            ["Can I start without a card?", "Yes. The Free plan includes 50 welcome credits and does not require a card."],
            ["Can I add credits without changing plans?", "Yes. One-off 250, 500 and 1,000-credit bundles are available from Credits & billing in the workspace."],
            ["How does annual billing work?", "Annual plans reduce the effective monthly price by 15%. The yearly total is shown directly on each plan before you choose it."],
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
        <p>50 free credits today. Starter is only $9 when you need more.</p>
        <Link className="button button-coral" href="/signup">
          Start creating free <ArrowRight size={17} />
        </Link>
      </section>

      <SiteFooter />
    </main>
  );
}
