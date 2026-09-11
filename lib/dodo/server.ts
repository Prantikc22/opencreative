import "server-only";
import DodoPayments from "dodopayments";
import { agentPricingPlans, creativePurchaseOptions } from "@/lib/pricing";

export type BillingCadence = "monthly" | "annual" | "one-time";
export type DodoPurchase = {
  itemId: string;
  cadence: BillingCadence;
  purchaseType: "subscription" | "credit_topup";
  family: "creative" | "agents";
  planId: string;
  credits: number;
  productId: string;
};

const productEnvNames: Record<string, string> = {
  "starter:monthly": "DODO_PRODUCT_CREATIVE_STARTER_MONTHLY",
  "creator:monthly": "DODO_PRODUCT_CREATIVE_CREATOR_MONTHLY",
  "creator:annual": "DODO_PRODUCT_CREATIVE_CREATOR_ANNUAL",
  "pro:monthly": "DODO_PRODUCT_CREATIVE_PRO_MONTHLY",
  "pro:annual": "DODO_PRODUCT_CREATIVE_PRO_ANNUAL",
  "pro-2700:monthly": "DODO_PRODUCT_CREATIVE_PRO_2700_MONTHLY",
  "pro-2700:annual": "DODO_PRODUCT_CREATIVE_PRO_2700_ANNUAL",
  "pro-3500:monthly": "DODO_PRODUCT_CREATIVE_PRO_3500_MONTHLY",
  "pro-3500:annual": "DODO_PRODUCT_CREATIVE_PRO_3500_ANNUAL",
  "studio:monthly": "DODO_PRODUCT_CREATIVE_STUDIO_MONTHLY",
  "studio:annual": "DODO_PRODUCT_CREATIVE_STUDIO_ANNUAL",
  "studio-8000:monthly": "DODO_PRODUCT_CREATIVE_STUDIO_8000_MONTHLY",
  "studio-8000:annual": "DODO_PRODUCT_CREATIVE_STUDIO_8000_ANNUAL",
  "studio-16000:monthly": "DODO_PRODUCT_CREATIVE_STUDIO_16000_MONTHLY",
  "studio-16000:annual": "DODO_PRODUCT_CREATIVE_STUDIO_16000_ANNUAL",
  "agent-launch:monthly": "DODO_PRODUCT_AGENT_LAUNCH_MONTHLY",
  "agent-launch:annual": "DODO_PRODUCT_AGENT_LAUNCH_ANNUAL",
  "agent-growth:monthly": "DODO_PRODUCT_AGENT_GROWTH_MONTHLY",
  "agent-growth:annual": "DODO_PRODUCT_AGENT_GROWTH_ANNUAL",
  "agent-scale:monthly": "DODO_PRODUCT_AGENT_SCALE_MONTHLY",
  "agent-scale:annual": "DODO_PRODUCT_AGENT_SCALE_ANNUAL",
  "credits-250:one-time": "DODO_PRODUCT_CREDITS_250",
  "credits-500:one-time": "DODO_PRODUCT_CREDITS_500",
  "credits-1000:one-time": "DODO_PRODUCT_CREDITS_1000",
};

export function getDodoPayments() {
  const bearerToken = process.env.DODO_PAYMENTS_API_KEY;
  if (!bearerToken) throw new Error("Dodo Payments is not configured.");
  return new DodoPayments({
    bearerToken,
    webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY || null,
    environment: process.env.DODO_PAYMENTS_ENVIRONMENT === "live_mode" ? "live_mode" : "test_mode",
  });
}

export function dodoProductId(itemId: string, cadence: BillingCadence) {
  const envName = productEnvNames[`${itemId}:${cadence}`];
  return envName ? process.env[envName] || "" : "";
}

export function dodoPurchase(itemId: string, cadence: BillingCadence): DodoPurchase | null {
  const productId = dodoProductId(itemId, cadence);
  if (!productId) return null;

  if (itemId.startsWith("credits-")) {
    const credits = Number(itemId.slice("credits-".length));
    if (cadence !== "one-time" || ![250, 500, 1000].includes(credits)) return null;
    return { itemId, cadence, purchaseType: "credit_topup", family: "creative", planId: "top-up", credits, productId };
  }

  const creative = creativePurchaseOptions().find((option) => option.id === itemId);
  if (creative && cadence !== "one-time" && (cadence !== "annual" || creative.supportsAnnual)) {
    return { itemId, cadence, purchaseType: "subscription", family: "creative", planId: creative.planId, credits: creative.credits, productId };
  }

  const agent = agentPricingPlans.find((plan) => plan.id === itemId && plan.monthlyPrice > 0 && !plan.custom);
  if (agent && cadence !== "one-time") {
    return { itemId, cadence, purchaseType: "subscription", family: "agents", planId: agent.id, credits: 0, productId };
  }
  return null;
}

export function dodoPurchaseForProduct(productId: string) {
  for (const [key, envName] of Object.entries(productEnvNames)) {
    if (process.env[envName] !== productId) continue;
    const separator = key.lastIndexOf(":");
    return dodoPurchase(key.slice(0, separator), key.slice(separator + 1) as BillingCadence);
  }
  return null;
}

export function billingAppUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || "https://www.opencreativehq.com").replace(/\/$/, "");
}
