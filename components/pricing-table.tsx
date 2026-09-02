"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import {
  annualDiscount,
  annualTotal,
  monthlyEquivalent,
  pricingPlans,
} from "@/lib/pricing";

export function PricingTable() {
  const [annual, setAnnual] = useState(false);

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
        Start free. Upgrade from $9 only when the work needs it.
      </p>
      <div className="pricing-grid-public">
        {pricingPlans.map((plan) => {
          const price = annual
            ? monthlyEquivalent(plan.monthlyPrice)
            : plan.monthlyPrice;
          return (
            <article id={plan.id} className={plan.featured ? "featured" : ""} key={plan.id}>
              {plan.featured && <em>Most popular</em>}
              <div className="plan-heading">
                <span>{plan.name}</span>
                <small>{plan.credits.toLocaleString()} credits</small>
              </div>
              <p className="plan-description">{plan.description}</p>
              <div className="plan-price">
                <h2>${price}</h2>
                <span>/ month</span>
              </div>
              {annual && plan.monthlyPrice > 0 ? (
                <small className="annual-note">
                  ${annualTotal(plan.monthlyPrice).toLocaleString()} billed yearly
                </small>
              ) : (
                <small className="annual-note">
                  {plan.monthlyPrice > 0 ? "Billed monthly" : "No card required"}
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
              <Link href={plan.id === "free" ? "/signup" : `/signup?plan=${plan.id}`}>
                {plan.id === "free" ? "Start creating free" : `Choose ${plan.name}`}
                <ArrowRight size={16} />
              </Link>
            </article>
          );
        })}
      </div>
    </>
  );
}
