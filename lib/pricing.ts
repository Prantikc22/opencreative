export type PricingPlan = {
  id: string;
  name: string;
  monthlyPrice: number;
  credits: number;
  description: string;
  features: string[];
  featured: boolean;
  custom: boolean;
};

export type AgentPricingPlan = {
  id: string;
  name: string;
  monthlyPrice: number;
  includedMinutes: number;
  overagePerMinute: number | null;
  agents: number | "Custom";
  concurrency: number | "Custom";
  description: string;
  features: string[];
  featured: boolean;
  custom: boolean;
};

export const pricingPlans: PricingPlan[] = [
  { id: "free", name: "Free", monthlyPrice: 0, credits: 50, description: "Try the creative production loop before you pay.", featured: false, custom: false, features: ["50 welcome credits", "Image, video, voice, music and avatar studios", "Projects and organized asset library", "Bring your own provider key"] },
  { id: "starter", name: "Starter", monthlyPrice: 9, credits: 250, description: "For a steady stream of everyday creative work.", featured: false, custom: false, features: ["250 managed credits monthly", "Every creative studio", "Watermark-free commercial exports", "Projects and asset library", "One-off credit top-ups"] },
  { id: "creator", name: "Creator", monthlyPrice: 19, credits: 750, description: "For creators shipping campaigns every week.", featured: true, custom: false, features: ["750 managed credits monthly", "Everything in Starter", "Brand, product and avatar identities", "UGC and product-video workflows", "Voice, transcription and translation"] },
  { id: "pro", name: "Pro", monthlyPrice: 49, credits: 1900, description: "For small teams producing at a serious cadence.", featured: false, custom: false, features: ["1,900 managed credits monthly", "Everything in Creator", "Premium quality tiers", "Priority generation routing", "Priority email support"] },
  { id: "studio", name: "Studio", monthlyPrice: 99, credits: 4000, description: "For studios running multiple brands and campaigns.", featured: false, custom: false, features: ["4,000 managed credits monthly", "Everything in Pro", "5 workspace seats", "Shared brand systems", "Usage analytics and faster support"] },
  { id: "enterprise", name: "Enterprise", monthlyPrice: 0, credits: 100000, description: "For organizations that need custom scale, controls and support.", featured: false, custom: true, features: ["Custom credit and seat packages", "Everything in Studio", "SSO and advanced access controls", "Custom data and provider policies", "Dedicated success and support"] },
];

export const agentPricingPlans: AgentPricingPlan[] = [
  {
    id: "agent-sandbox",
    name: "Sandbox",
    monthlyPrice: 0,
    includedMinutes: 15,
    overagePerMinute: null,
    agents: 1,
    concurrency: 2,
    description: "Build and test a grounded voice agent before deployment.",
    featured: false,
    custom: false,
    features: ["15 agent minutes", "1 agent", "2 concurrent sessions", "Web voice and text widget"],
  },
  {
    id: "agent-launch",
    name: "Launch",
    monthlyPrice: 29,
    includedMinutes: 150,
    overagePerMinute: 0.12,
    agents: 3,
    concurrency: 5,
    description: "For a focused support or qualification experience.",
    featured: false,
    custom: false,
    features: ["150 agent minutes", "3 agents", "5 concurrent sessions", "$0.12 per extra minute"],
  },
  {
    id: "agent-growth",
    name: "Growth",
    monthlyPrice: 99,
    includedMinutes: 650,
    overagePerMinute: 0.12,
    agents: 10,
    concurrency: 15,
    description: "For teams handling meaningful customer volume.",
    featured: true,
    custom: false,
    features: ["650 agent minutes", "10 agents", "15 concurrent sessions", "$0.12 per extra minute"],
  },
  {
    id: "agent-scale",
    name: "Scale",
    monthlyPrice: 299,
    includedMinutes: 1800,
    overagePerMinute: 0.12,
    agents: 30,
    concurrency: 40,
    description: "For multiple deployed agents and higher concurrency.",
    featured: false,
    custom: false,
    features: ["1,800 agent minutes", "30 agents", "40 concurrent sessions", "$0.12 per extra minute"],
  },
  {
    id: "agent-enterprise",
    name: "Enterprise",
    monthlyPrice: 0,
    includedMinutes: 0,
    overagePerMinute: null,
    agents: "Custom",
    concurrency: "Custom",
    description: "For custom volume, controls, data policy and support.",
    featured: false,
    custom: true,
    features: ["Contracted minute volume", "Custom concurrency", "SSO and access controls", "Dedicated implementation support"],
  },
];

export const agentModelStack = {
  transcription: "openai/gpt-4o-mini-transcribe",
  reasoning: "google/gemini-3.5-flash-lite",
  speech: "google/gemini-3.1-flash-tts-preview",
} as const;

// Conservative fully-loaded target for one browser-based agent minute. This
// covers speech recognition, reasoning, synthesis, retries and routing. It does
// not include telephony, phone numbers or carrier charges.
export const targetAgentProviderCostPerMinute = 0.035;

export const creditBundles = [
  { credits: 250, price: 15, description: "A focused launch, campaign extension or creative sprint.", featured: false },
  { credits: 500, price: 29, description: "The best-value top-up for an active creator workflow.", featured: true },
  { credits: 1000, price: 55, description: "Extra capacity for a production-heavy month.", featured: false },
] as const;

export const annualDiscount = 20;
export const paddlePercentageFee = 0.05;
export const paddleFixedFeeUsd = 0.5;

export function paddleTransactionFee(amountUsd: number) {
  return amountUsd * paddlePercentageFee + paddleFixedFeeUsd;
}

export function monthlyEquivalent(monthlyPrice: number) {
  return monthlyPrice * (1 - annualDiscount / 100);
}
export function annualTotal(monthlyPrice: number) {
  return monthlyPrice * 12 * (1 - annualDiscount / 100);
}

// The catalog is weighted so one managed credit represents no more than about
// $0.006 of direct provider cost. Pricing is stress-tested against this ceiling.
export const targetProviderCostPerCredit = 0.006;
