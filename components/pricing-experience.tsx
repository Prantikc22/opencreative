"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Bot, Check, Palette, Sparkles } from "lucide-react";
import { PricingCalculator } from "@/components/pricing-calculator";
import { PricingTable } from "@/components/pricing-table";
import { agentPricingPlans, pricingPlans } from "@/lib/pricing";

export function PricingExperience() {
  const [family, setFamily] = useState<"creative" | "agents">("creative");
  const plans = family === "creative" ? pricingPlans : agentPricingPlans;

  return (
    <>
      <section className="product-family-switch" aria-label="Choose a product family">
        <button type="button" className={family === "creative" ? "active" : ""} onClick={() => setFamily("creative")}>
          <Palette size={19} /><span><strong>Creative Studio</strong><small>Image, video, voice, music and avatars</small></span>
        </button>
        <button type="button" className={family === "agents" ? "active" : ""} onClick={() => setFamily("agents")}>
          <Bot size={19} /><span><strong>OpenCreative Agents</strong><small>Voice and text customer agents</small></span>
        </button>
      </section>

      <div id="plans"><PricingTable family={family} /></div>
      <div className="pricing-assurance" aria-label="Pricing assurances">
        <span><Check size={16} /> No card to start</span>
        <span><Check size={16} /> Usage is visible before billing</span>
        <span><Check size={16} /> Failed jobs are not charged</span>
        <span><Check size={16} /> Add the other product separately</span>
      </div>

      {family === "creative" ? <PricingCalculator /> : <AgentUsageGuide />}

      <section className="pricing-comparison" id="compare">
        <header>
          <p className="eyebrow"><Sparkles size={14} /> Compare {family === "creative" ? "creative" : "agent"} plans</p>
          <h2>See exactly what changes as you grow.</h2>
          <p>Each subscription unlocks one product family. Add the other family later without replacing your current plan.</p>
        </header>
        <div className="comparison-scroll">
          <table>
            <thead><tr><th>Capability</th>{plans.map((plan) => <th key={plan.id}>{plan.name}</th>)}</tr></thead>
            <tbody>{family === "creative" ? <CreativeRows /> : <AgentRows />}</tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function CreativeRows() {
  return <>{[
    ["Monthly credits", "50 welcome", "250", "750", "1,900", "4,000", "Custom"],
    ["Image, video, voice, music and avatars", true, true, true, true, true, true],
    ["Projects and asset library", true, true, true, true, true, true],
    ["Watermark-free commercial exports", false, true, true, true, true, true],
    ["Brand, product and avatar identities", false, false, true, true, true, true],
    ["Premium quality tiers", false, false, false, true, true, true],
    ["Workspace seats", "1", "1", "1", "2", "5", "Custom"],
    ["Agent Studio access", false, false, false, false, false, "Separate contract"],
  ].map(([label, ...values]) => <ComparisonRow key={String(label)} label={String(label)} values={values} />)}</>;
}

function AgentRows() {
  return <>{[
    ["Included agent minutes", "15", "150", "650", "1,800", "Custom"],
    ["Deployed agents", "1", "3", "10", "30", "Custom"],
    ["Concurrent sessions", "2", "5", "15", "40", "Custom"],
    ["Web voice and text widget", true, true, true, true, true],
    ["Knowledge grounding", true, true, true, true, true],
    ["Usage analytics", false, true, true, true, true],
    ["SSO and advanced controls", false, false, false, false, true],
    ["Creative Studio access", false, false, false, false, "Separate contract"],
  ].map(([label, ...values]) => <ComparisonRow key={String(label)} label={String(label)} values={values} />)}</>;
}

function ComparisonRow({ label, values }: { label: string; values: unknown[] }) {
  return <tr><th>{label}</th>{values.map((value, index) => <td key={`${label}-${index}`}>{typeof value === "boolean" ? value ? <Check size={18} aria-label="Included" /> : <span aria-label="Not included">×</span> : String(value)}</td>)}</tr>;
}

function AgentUsageGuide() {
  return (
    <section className="pricing-calculator agent-usage-guide" id="calculator">
      <header>
        <p className="eyebrow"><Bot size={15} /> Agent usage</p>
        <h2>Minutes that map to real conversations.</h2>
        <p>Agent billing covers speech recognition, reasoning and speech synthesis. Telephony and phone-number charges are not included.</p>
      </header>
      <div className="agent-economics-grid">
        <article><span>01</span><h3>Listen</h3><strong>Smart Transcript</strong><p>OpenAI GPT-4o mini Transcribe turns the customer&apos;s speech into text.</p></article>
        <article><span>02</span><h3>Reason</h3><strong>Creative Director Fast</strong><p>Gemini 3.5 Flash Lite answers from the connected company knowledge.</p></article>
        <article><span>03</span><h3>Speak</h3><strong>Expressive Voice</strong><p>Gemini 3.1 Flash TTS returns the answer in a natural voice.</p></article>
        <article className="agent-usage-cta"><h3>Start with 15 minutes.</h3><p>Test the web widget before choosing a paid deployment.</p><Link href="/signup?product=agents&plan=agent-sandbox">Test an agent <ArrowRight size={16} /></Link></article>
      </div>
    </section>
  );
}
