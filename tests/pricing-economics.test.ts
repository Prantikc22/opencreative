import { describe, expect, it } from "vitest";
import { curatedModels } from "@/lib/models/registry";
import {
  annualTotal,
  agentModelStack,
  agentPricingPlans,
  paddlePercentageFee,
  paddleTransactionFee,
  pricingPlans,
  targetAgentProviderCostPerMinute,
  targetProviderCostPerCredit,
} from "@/lib/pricing";

const billableCapabilities = new Set([
  "text",
  "image",
  "video",
  "avatar",
  "music",
  "speech",
  "transcription",
]);

describe("pricing economics", () => {
  it("keeps five self-serve plans and Enterprise separate", () => {
    expect(pricingPlans.filter((plan) => !plan.custom)).toHaveLength(5);
    expect(pricingPlans.filter((plan) => plan.custom)).toHaveLength(1);
  });

  it("weights every billable curated model below the provider-cost ceiling", () => {
    const ratios = curatedModels
      .filter((model) => billableCapabilities.has(model.capability))
      .map((model) => ({
        id: model.id,
        costPerCredit: model.approximateCostUsd / model.creditBase,
      }));

    for (const ratio of ratios) {
      expect(ratio.costPerCredit, ratio.id).toBeLessThanOrEqual(
        targetProviderCostPerCredit,
      );
    }
  });

  it("retains at least 60% contribution margin under a 15% cost shock and Paddle fees", () => {
    const paidPlans = pricingPlans.filter(
      (plan) => !plan.custom && plan.monthlyPrice > 0,
    );

    for (const plan of paidPlans) {
      const stressedProviderCost =
        plan.credits * targetProviderCostPerCredit * 1.15;
      const scenarios = [
        {
          label: "monthly",
          revenue: plan.monthlyPrice,
          paymentFee: paddleTransactionFee(plan.monthlyPrice),
        },
        {
          label: "annual",
          revenue: annualTotal(plan.monthlyPrice) / 12,
          paymentFee: paddleTransactionFee(annualTotal(plan.monthlyPrice)) / 12,
        },
      ];

      for (const scenario of scenarios) {
        const contributionMargin =
          (scenario.revenue - stressedProviderCost - scenario.paymentFee) /
          scenario.revenue;
        expect(contributionMargin, `${plan.name} ${scenario.label}`).toBeGreaterThanOrEqual(0.6);
      }
    }
  });

  it("retains at least 60% agent contribution margin under the same stress case", () => {
    const paidPlans = agentPricingPlans.filter((plan) => !plan.custom && plan.monthlyPrice > 0);
    for (const plan of paidPlans) {
      const stressedProviderCost = plan.includedMinutes * targetAgentProviderCostPerMinute * 1.15;
      const scenarios = [
        { label: "monthly", revenue: plan.monthlyPrice, paymentFee: paddleTransactionFee(plan.monthlyPrice) },
        { label: "annual", revenue: annualTotal(plan.monthlyPrice) / 12, paymentFee: paddleTransactionFee(annualTotal(plan.monthlyPrice)) / 12 },
      ];
      for (const scenario of scenarios) {
        const contributionMargin = (scenario.revenue - stressedProviderCost - scenario.paymentFee) / scenario.revenue;
        expect(contributionMargin, `${plan.name} ${scenario.label}`).toBeGreaterThanOrEqual(0.6);
      }
    }
  });

  it("keeps agent overage pricing above the stressed cost floor", () => {
    for (const plan of agentPricingPlans.filter((plan) => plan.overagePerMinute)) {
      const revenue = plan.overagePerMinute!;
      const stressedCost = targetAgentProviderCostPerMinute * 1.15;
      const margin = (revenue - stressedCost - revenue * paddlePercentageFee) / revenue;
      expect(margin, plan.name).toBeGreaterThanOrEqual(0.6);
    }
  });

  it("uses an explicit speech, reasoning and transcription stack for agent estimates", () => {
    expect(Object.keys(agentModelStack)).toEqual(["transcription", "reasoning", "speech"]);
  });
});
