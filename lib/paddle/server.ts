import "server-only";
import { Environment, LogLevel, Paddle } from "@paddle/paddle-node-sdk";

export function getPaddle() {
  const apiKey = process.env.PADDLE_API_KEY;
  if (!apiKey) throw new Error("Paddle is not configured.");
  return new Paddle(apiKey, {
    environment: process.env.NEXT_PUBLIC_PADDLE_ENV === "production" ? Environment.production : Environment.sandbox,
    logLevel: LogLevel.error,
  });
}

const envNames: Record<string, string> = {
  "starter:monthly": "PADDLE_PRICE_CREATIVE_STARTER_MONTHLY",
  "starter:annual": "PADDLE_PRICE_CREATIVE_STARTER_ANNUAL",
  "creator:monthly": "PADDLE_PRICE_CREATIVE_CREATOR_MONTHLY",
  "creator:annual": "PADDLE_PRICE_CREATIVE_CREATOR_ANNUAL",
  "pro:monthly": "PADDLE_PRICE_CREATIVE_PRO_MONTHLY",
  "pro:annual": "PADDLE_PRICE_CREATIVE_PRO_ANNUAL",
  "studio:monthly": "PADDLE_PRICE_CREATIVE_STUDIO_MONTHLY",
  "studio:annual": "PADDLE_PRICE_CREATIVE_STUDIO_ANNUAL",
  "agent-launch:monthly": "PADDLE_PRICE_AGENT_LAUNCH_MONTHLY",
  "agent-launch:annual": "PADDLE_PRICE_AGENT_LAUNCH_ANNUAL",
  "agent-growth:monthly": "PADDLE_PRICE_AGENT_GROWTH_MONTHLY",
  "agent-growth:annual": "PADDLE_PRICE_AGENT_GROWTH_ANNUAL",
  "agent-scale:monthly": "PADDLE_PRICE_AGENT_SCALE_MONTHLY",
  "agent-scale:annual": "PADDLE_PRICE_AGENT_SCALE_ANNUAL",
  "credits-250:one-time": "PADDLE_PRICE_CREDITS_250",
  "credits-500:one-time": "PADDLE_PRICE_CREDITS_500",
  "credits-1000:one-time": "PADDLE_PRICE_CREDITS_1000",
};

export function paddlePriceId(item: string, cadence: "monthly" | "annual" | "one-time") {
  const name = envNames[`${item}:${cadence}`];
  return name ? process.env[name] || "" : "";
}
