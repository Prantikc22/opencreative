"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, AudioLines, Check, CircleUserRound, Clapperboard, ImageIcon, Sparkles } from "lucide-react";
import {
  agentPricingPlans,
  annualDiscount,
  annualTotal,
  capacityOptionFor,
  capacityOptionsFor,
  creativeOutputExamples,
  monthlyEquivalent,
  pricingPlans,
} from "@/lib/pricing";

const outputIcons = {
  image: ImageIcon,
  video: Clapperboard,
  audio: AudioLines,
  avatar: CircleUserRound,
};

export function PricingTable({ family = "creative" }: { family?: "creative" | "agents" }) {
  const [annual, setAnnual] = useState(false);
  const [capacityByPlan, setCapacityByPlan] = useState<Record<string, string>>({});
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
        Starter is always $9 monthly. Creator at $19 adds video, avatars, Kling 3.0, Seedance 2.5, Veo 3.1 and Sora 2 Pro. Pro and Studio let you scale monthly credits.
      </p>
      <div className="pricing-grid-public">
        {selfServePlans.map((plan) => {
          const options = capacityOptionsFor(plan);
          const selectedOption = capacityOptionFor(plan, capacityByPlan[plan.id]);
          const optionIndex = options.findIndex((option) => option.id === selectedOption.id);
          const annualForPlan = annual && plan.supportsAnnual !== false;
          const price = annualForPlan ? monthlyEquivalent(selectedOption.monthlyPrice) : selectedOption.monthlyPrice;
          const priceLabel = annualForPlan && selectedOption.monthlyPrice > 0
            ? price.toFixed(2)
            : String(price);
          const yearlyLabel = annualTotal(selectedOption.monthlyPrice).toLocaleString(
            "en-US",
            { minimumFractionDigits: 2, maximumFractionDigits: 2 },
          );
          const outputExamples = plan.capacityOptions
            ? creativeOutputExamples(selectedOption.credits, true)
            : plan.outputExamples;
          return (
            <article id={plan.id} data-plan={plan.id} className={plan.featured ? "featured" : ""} key={plan.id}>
              {plan.featured && <em>Most popular</em>}
              <div className="plan-heading">
                <span>{plan.name}</span>
                <small>{selectedOption.credits.toLocaleString()} credits</small>
              </div>
              <p className="plan-description">{plan.description}</p>
              <div className={`plan-price ${plan.custom ? "custom-price" : ""}`}>
                <h2>{plan.custom ? "Let’s talk" : `$${priceLabel}`}</h2>
                {!plan.custom && <span>/ month</span>}
              </div>
              {annualForPlan && selectedOption.monthlyPrice > 0 ? (
                <small className="annual-note">
                  ${yearlyLabel} billed yearly
                </small>
              ) : (
                <small className="annual-note">
                  {plan.monthlyPrice > 0 ? plan.supportsAnnual === false && annual ? "Monthly only · no annual discount" : "Billed monthly" : "No card required"}
                </small>
              )}
              {plan.capacityOptions && (
                <div className="plan-capacity-control">
                  <div><span>Monthly credits</span><strong>{selectedOption.credits.toLocaleString()}</strong></div>
                  <input
                    type="range"
                    min={0}
                    max={options.length - 1}
                    step={1}
                    value={optionIndex}
                    aria-label={`${plan.name} monthly credits`}
                    aria-valuetext={`${selectedOption.credits.toLocaleString()} credits for $${selectedOption.monthlyPrice} per month`}
                    onChange={(event) => setCapacityByPlan((current) => ({ ...current, [plan.id]: options[Number(event.target.value)].id }))}
                  />
                  <div className="plan-capacity-marks">
                    {options.map((option, index) => (
                      <button
                        type="button"
                        className={index === optionIndex ? "active" : ""}
                        key={option.id}
                        onClick={() => setCapacityByPlan((current) => ({ ...current, [plan.id]: option.id }))}
                      >
                        {option.credits >= 1000 ? `${option.credits / 1000}k` : option.credits}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="plan-output" aria-label={`Approximate ${plan.name} plan output`}>
                <div className="plan-output-heading">
                  <span>Approximate monthly capacity</span>
                  <small>Spend all credits on one type</small>
                </div>
                <dl>
                  {outputExamples.map((example) => {
                    const Icon = outputIcons[example.kind];
                    return (
                      <div key={`${example.kind}-${example.label}`}>
                        <dt><Icon size={16} /><strong>{example.amount}</strong><span>{example.label}</span></dt>
                        <dd>{example.detail}</dd>
                      </div>
                    );
                  })}
                </dl>
                {plan.modelAccess && <div className="plan-model-access"><Sparkles size={14} /><p><strong>Every top video model</strong><small>{plan.modelAccess}</small></p></div>}
                <small>Estimates vary by model, duration, resolution and audio. Your exact credit cost appears before generation.</small>
              </div>
              <strong><Sparkles size={15} /> What you get</strong>
              <ul>
                {plan.features.map((feature, index) => {
                  const label = plan.capacityOptions && index === 0 ? `${selectedOption.credits.toLocaleString()} managed credits monthly` : feature;
                  return <li key={feature}>
                    <Check size={16} />
                    {label}
                  </li>;
                })}
              </ul>
              <Link href={plan.id === "free" ? "/signup?product=creative" : `/signup?product=creative&plan=${selectedOption.id}&billing=${annualForPlan ? "annual" : "monthly"}`}>
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
