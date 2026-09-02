export const pricingPlans = [
  {
    id: "free",
    name: "Free",
    monthlyPrice: 0,
    credits: 50,
    description: "Try the full creative loop before you pay.",
    featured: false,
    features: [
      "50 welcome credits",
      "Image, video, voice and avatar studios",
      "Projects and organized asset library",
      "Bring your own provider key",
    ],
  },
  {
    id: "starter",
    name: "Starter",
    monthlyPrice: 9,
    credits: 250,
    description: "For a steady stream of everyday creative work.",
    features: [
      "250 managed generation credits monthly",
      "Every image, video, voice and avatar studio",
      "Watermark-free commercial exports",
      "Projects and organized asset library",
      "Buy extra credits only when you need them",
    ],
    featured: false,
  },
  {
    id: "creator",
    name: "Creator",
    monthlyPrice: 19,
    credits: 750,
    description: "For creators shipping campaigns every week.",
    features: [
      "750 managed generation credits monthly",
      "Everything in Starter",
      "Brand, product and avatar identities",
      "UGC, ad and product-video workflows",
      "Voice, transcription and translation",
    ],
    featured: true,
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: 49,
    credits: 2000,
    description: "For small teams producing at a serious cadence.",
    featured: false,
    features: [
      "2,000 managed generation credits monthly",
      "Everything in Creator",
      "Advanced models and premium quality tiers",
      "Priority generation routing",
      "Priority email support",
    ],
  },
] as const;

export const creditBundles = [
  {
    credits: 250,
    price: 15,
    description: "A focused launch, campaign extension or creative sprint.",
    featured: false,
  },
  {
    credits: 500,
    price: 29,
    description: "The best-value top-up for an active creator workflow.",
    featured: true,
  },
  {
    credits: 1000,
    price: 55,
    description: "Extra capacity for a production-heavy month.",
    featured: false,
  },
] as const;

export const annualDiscount = 20;

export function monthlyEquivalent(monthlyPrice: number) {
  return Math.round(monthlyPrice * (1 - annualDiscount / 100));
}

export function annualTotal(monthlyPrice: number) {
  return monthlyEquivalent(monthlyPrice) * 12;
}
