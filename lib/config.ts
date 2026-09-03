export const productConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || "OpenCreative",
  appUrl: (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, ""),
  tagline: "The open-source AI creative studio.",
  description:
    "Create videos, ads, UGC, images, voices and avatars with the world's best AI models.",
  githubUrl:
    process.env.NEXT_PUBLIC_GITHUB_URL ||
    "https://github.com/Prantikc22/opencreative",
  supportEmail:
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "hello@opencreative.ai",
  supportPhone: process.env.NEXT_PUBLIC_SUPPORT_PHONE || "",
  legalName: process.env.NEXT_PUBLIC_LEGAL_NAME || "ResoluteX HQ",
} as const;
