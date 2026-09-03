"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import {
  agentPricingPlans,
  annualDiscount,
  annualTotal,
  monthlyEquivalent,
  pricingPlans,
} from "@/lib/pricing";

export function PricingTable({ family = "creative" }: { family?: "creative" | "agents" }) {
  const [annual, setAnnual] = useState(false);
  if (family === "agents") return <AgentPricingTable annual={annual} setAnnual={setAnnual} />;
  const selfServePlans = pricingPlans.filter((plan) => !plan.custom);
  const enterprise = pricingPlans.find((plan) => plan.custom)!;

  return (
    <>
      <div className="billing-toggle" aria-label="Billing frequency">
        <button className={!annual ? "active" : ""} onClick={() => setAnnual(false)}>
          Monthly
        </button>
        <button className={annual ? "active" : ""} onClick={() => setAnnual(true)}>
          Annual <span>Save {annualDiscount}%</span>
        </button>
      </div>
      <p className="billing-helper">
        Creative plans unlock image, video, voice, music and avatar tools. OpenCreative Agents are available in the adjacent tab.
      </p>
      <div className="pricing-grid-public">
        {selfServePlans.map((plan) => {
          const price = annual && !plan.custom
            ? monthlyEquivalent(plan.monthlyPrice)
            : plan.monthlyPrice;
          const priceLabel = annual && plan.monthlyPrice > 0
            ? price.toFixed(2)
            : String(price);
          const yearlyLabel = annualTotal(plan.monthlyPrice).toLocaleString(
            "en-US",
            { minimumFractionDigits: 2, maximumFractionDigits: 2 },
          );
          return (
            <article id={plan.id} className={plan.featured ? "featured" : ""} key={plan.id}>
              {plan.featured && <em>Most popular</em>}
              <div className="plan-heading">
                <span>{plan.name}</span>
                <small>{plan.custom ? "Custom scale" : `${plan.credits.toLocaleString()} credits`}</small>
              </div>
              <p className="plan-description">{plan.description}</p>
              <div className={`plan-price ${plan.custom ? "custom-price" : ""}`}>
                <h2>{plan.custom ? "Let’s talk" : `$${priceLabel}`}</h2>
                {!plan.custom && <span>/ month</span>}
              </div>
              {annual && plan.monthlyPrice > 0 && !plan.custom ? (
                <small className="annual-note">
                  ${yearlyLabel} billed yearly
                </small>
              ) : (
                <small className="annual-note">
                  {plan.custom ? "A plan built around your organization" : plan.monthlyPrice > 0 ? "Billed monthly" : "No card required"}
                </small>
              )}
              <strong><Sparkles size={15} /> What you get</strong>
              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <Check size={16} />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href={plan.id === "free" ? "/signup?product=creative" : `/signup?product=creative&plan=${plan.id}&billing=${annual ? "annual" : "monthly"}`}>
                {plan.custom ? "Request a custom quote" : plan.id === "free" ? "Start creating free" : `Choose ${plan.name}`}
                <ArrowRight size={16} />
              </Link>
            </article>
          );
        })}
      </div>
      <article className="pricing-enterprise" id={enterprise.id}>
        <div>
          <span>Enterprise</span>
          <h2>Custom volume.<br />Custom controls.</h2>
        </div>
        <p>{enterprise.description}</p>
        <ul>
          {enterprise.features.map((feature) => (
            <li key={feature}><Check size={16} /> {feature}</li>
          ))}
        </ul>
        <Link href="/signup?product=creative&plan=enterprise">
          Request a custom quote <ArrowRight size={16} />
        </Link>
      </article>
    </>
  );
}

function AgentPricingTable({ annual, setAnnual }: { annual: boolean; setAnnual: (value: boolean) => void }) {
  const selfServePlans = agentPricingPlans.filter((plan) => !plan.custom);
  const enterprise = agentPricingPlans.find((plan) => plan.custom)!;
  return (
    <>
      <div className="billing-toggle" aria-label="Agent billing frequency">
        <button className={!annual ? "active" : ""} onClick={() => setAnnual(false)}>Monthly</button>
        <button className={annual ? "active" : ""} onClick={() => setAnnual(true)}>Annual <span>Save {annualDiscount}%</span></button>
      </div>
      <p className="billing-helper">Agent plans cover voice and text agent usage. Your OpenCreative account can also add Creative Studio whenever needed.</p>
      <div className="pricing-grid-public agent-pricing-grid">
        {selfServePlans.map((plan) => {
          const price = annual ? monthlyEquivalent(plan.monthlyPrice) : plan.monthlyPrice;
          return (
            <article id={plan.id} className={plan.featured ? "featured" : ""} key={plan.id}>
              {plan.featured && <em>Best for teams</em>}
              <div className="plan-heading"><span>{plan.name}</span><small>{plan.includedMinutes.toLocaleString()} minutes included</small></div>
              <p className="plan-description">{plan.description}</p>
              <div className="plan-price"><h2>${annual && plan.monthlyPrice > 0 ? price.toFixed(2) : price}</h2><span>/ month</span></div>
              <small className="annual-note">{annual && plan.monthlyPrice > 0 ? `$${annualTotal(plan.monthlyPrice).toFixed(2)} billed yearly` : plan.monthlyPrice ? "Billed monthly" : "No card required"}</small>
              <strong><Sparkles size={15} /> What you get</strong>
              <ul>{plan.features.map((feature) => <li key={feature}><Check size={16} />{feature}</li>)}</ul>
              <Link href={`/signup?product=agents&plan=${plan.id}&billing=${annual ? "annual" : "monthly"}`}>{plan.monthlyPrice ? `Choose ${plan.name}` : "Test an agent free"}<ArrowRight size={16} /></Link>
            </article>
          );
        })}
      </div>
      <article className="pricing-enterprise" id={enterprise.id}>
        <div><span>Agent Enterprise</span><h2>Custom volume.<br />Controlled deployment.</h2></div>
        <p>{enterprise.description}</p>
        <ul>{enterprise.features.map((feature) => <li key={feature}><Check size={16} /> {feature}</li>)}</ul>
        <Link href="/signup?product=agents&plan=agent-enterprise">Request an agent quote <ArrowRight size={16} /></Link>
      </article>
    </>
  );
}
