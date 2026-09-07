export type PricingCapacityOption = {
  id: string;
  credits: number;
  monthlyPrice: number;
};

export type PricingPlan = {
  id: string;
  name: string;
  monthlyPrice: number;
  credits: number;
  description: string;
  outputExamples: Array<{
    kind: "image" | "video" | "audio" | "avatar";
    amount: string;
    label: string;
    detail: string;
  }>;
  modelAccess?: string;
  capacityOptions?: PricingCapacityOption[];
  supportsAnnual?: boolean;
  features: string[];
  featured: boolean;
  custom: boolean;
};

export function creativeOutputExamples(credits: number, includesVideo: boolean): PricingPlan["outputExamples"] {
  const base = [
    { kind: "image" as const, amount: `~${Math.floor(credits / 12).toLocaleString()}`, label: "images", detail: "standard generation" },
    { kind: "audio" as const, amount: `~${Math.floor(credits / 4).toLocaleString()}`, label: "voice minutes", detail: "standard speech" },
  ];
  if (!includesVideo) return base;
  return [
    { kind: "video", amount: `~${Math.floor(credits / 340)}–${Math.floor(credits / 65)}`, label: "videos", detail: "5-sec clips · premium to fast" },
    base[0],
    base[1],
    { kind: "avatar", amount: `~${Math.floor(credits / 105)}`, label: "avatar clips", detail: "5-sec clips" },
  ];
}

export function capacityOptionsFor(plan: PricingPlan) {
  return plan.capacityOptions || [{ id: plan.id, credits: plan.credits, monthlyPrice: plan.monthlyPrice }];
}

export function capacityOptionFor(plan: PricingPlan, optionId?: string | null) {
  return capacityOptionsFor(plan).find((option) => option.id === optionId) || capacityOptionsFor(plan)[0];
}

export function creativePurchaseOptions() {
  return pricingPlans
    .filter((plan) => plan.monthlyPrice > 0 && !plan.custom)
    .flatMap((plan) => capacityOptionsFor(plan).map((option) => ({ ...option, planId: plan.id, supportsAnnual: plan.supportsAnnual !== false })));
}

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
  { id: "free", name: "Free", monthlyPrice: 0, credits: 50, description: "Explore image and audio creation before you pay.", outputExamples: creativeOutputExamples(50, false), featured: false, custom: false, features: ["50 welcome credits", "Image and audio generation", "Projects and organized asset library", "Bring your own provider key"] },
  { id: "starter", name: "Starter", monthlyPrice: 9, credits: 250, description: "A focused visual and voice toolkit for everyday creation.", outputExamples: creativeOutputExamples(250, false), supportsAnnual: false, featured: false, custom: false, features: ["250 managed credits monthly", "Image and audio generation", "Watermark-free commercial exports", "Projects and asset library", "One-off credit top-ups"] },
  { id: "creator", name: "Creator", monthlyPrice: 19, credits: 750, description: "Build complete social campaigns with motion, voice and reusable identities.", outputExamples: creativeOutputExamples(750, true), modelAccess: "Kling 3.0 · Seedance 2.5 · Veo 3.1 · Sora 2 Pro", featured: true, custom: false, features: ["750 managed credits monthly", "Everything in Starter", "All premium video models", "Video, avatars and campaign workflows", "Brand, product and avatar identities", "Voice, transcription and translation"] },
  { id: "pro", name: "Pro", monthlyPrice: 49, credits: 1900, description: "Run a serious weekly production cadence with premium routing and support.", outputExamples: creativeOutputExamples(1900, true), capacityOptions: [{ id: "pro", credits: 1900, monthlyPrice: 49 }, { id: "pro-2700", credits: 2700, monthlyPrice: 69 }, { id: "pro-3500", credits: 3500, monthlyPrice: 89 }], modelAccess: "Kling 3.0 · Seedance 2.5 · Veo 3.1 · Sora 2 Pro", featured: false, custom: false, features: ["1,900 managed credits monthly", "Everything in Creator", "All premium video models", "Priority generation routing", "Priority email support"] },
  { id: "studio", name: "Studio", monthlyPrice: 99, credits: 4000, description: "Give a small team the capacity to operate several brands and campaigns.", outputExamples: creativeOutputExamples(4000, true), capacityOptions: [{ id: "studio", credits: 4000, monthlyPrice: 99 }, { id: "studio-8000", credits: 8000, monthlyPrice: 189 }, { id: "studio-16000", credits: 16000, monthlyPrice: 349 }], modelAccess: "Kling 3.0 · Seedance 2.5 · Veo 3.1 · Sora 2 Pro", featured: false, custom: false, features: ["4,000 managed credits monthly", "Everything in Pro", "All premium video models", "5 workspace seats", "Shared brand systems", "Usage analytics and faster support"] },
  { id: "enterprise", name: "Enterprise", monthlyPrice: 0, credits: 100000, description: "For organizations that need custom scale, controls and support.", outputExamples: [], featured: false, custom: true, features: ["Custom credit and seat packages", "Everything in Studio", "SSO and advanced access controls", "Custom data and provider policies", "Dedicated success and support"] },
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
