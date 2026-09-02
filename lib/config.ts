export const productConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || "OpenCreative",
  tagline: "The open-source AI creative studio.",
  description:
    "Create videos, ads, UGC, images, voices and avatars with the world's best AI models.",
  githubUrl:
    process.env.NEXT_PUBLIC_GITHUB_URL ||
    "https://github.com/opencreative-ai/opencreative",
  supportEmail:
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "hello@opencreative.ai",
} as const;
