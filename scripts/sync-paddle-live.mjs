import { chmod, writeFile } from "node:fs/promises";
import { Environment, Paddle } from "@paddle/paddle-node-sdk";

const apiKey = process.env.PADDLE_API_KEY;
const outputPath = process.env.PADDLE_SYNC_OUTPUT;

if (!apiKey) throw new Error("PADDLE_API_KEY is required.");
if (!outputPath) throw new Error("PADDLE_SYNC_OUTPUT is required.");

const paddle = new Paddle(apiKey, { environment: Environment.production });

const catalog = [
  {
    key: "creative-starter",
    name: "OpenCreative Starter",
    description: "Image and audio creation with 250 managed credits each month.",
    prices: [
      ["PADDLE_PRICE_CREATIVE_STARTER_MONTHLY", "starter-monthly", "Starter monthly", 900, "month"],
    ],
  },
  {
    key: "creative-creator",
    name: "OpenCreative Creator",
    description: "Complete creative production with 750 managed credits and premium video models.",
    prices: [
      ["PADDLE_PRICE_CREATIVE_CREATOR_MONTHLY", "creator-monthly", "Creator monthly", 1900, "month"],
      ["PADDLE_PRICE_CREATIVE_CREATOR_ANNUAL", "creator-annual", "Creator annual", 18240, "year"],
    ],
  },
  {
    key: "creative-pro",
    name: "OpenCreative Pro",
    description: "Scalable weekly production with premium routing and support.",
    prices: [
      ["PADDLE_PRICE_CREATIVE_PRO_MONTHLY", "pro-1900-monthly", "Pro 1,900 credits monthly", 4900, "month"],
      ["PADDLE_PRICE_CREATIVE_PRO_ANNUAL", "pro-1900-annual", "Pro 1,900 credits annual", 47040, "year"],
      ["PADDLE_PRICE_CREATIVE_PRO_2700_MONTHLY", "pro-2700-monthly", "Pro 2,700 credits monthly", 6900, "month"],
      ["PADDLE_PRICE_CREATIVE_PRO_2700_ANNUAL", "pro-2700-annual", "Pro 2,700 credits annual", 66240, "year"],
      ["PADDLE_PRICE_CREATIVE_PRO_3500_MONTHLY", "pro-3500-monthly", "Pro 3,500 credits monthly", 8900, "month"],
      ["PADDLE_PRICE_CREATIVE_PRO_3500_ANNUAL", "pro-3500-annual", "Pro 3,500 credits annual", 85440, "year"],
    ],
  },
  {
    key: "creative-studio",
    name: "OpenCreative Studio",
    description: "Team production capacity for multiple brands and campaigns.",
    prices: [
      ["PADDLE_PRICE_CREATIVE_STUDIO_MONTHLY", "studio-4000-monthly", "Studio 4,000 credits monthly", 9900, "month"],
      ["PADDLE_PRICE_CREATIVE_STUDIO_ANNUAL", "studio-4000-annual", "Studio 4,000 credits annual", 95040, "year"],
      ["PADDLE_PRICE_CREATIVE_STUDIO_8000_MONTHLY", "studio-8000-monthly", "Studio 8,000 credits monthly", 18900, "month"],
      ["PADDLE_PRICE_CREATIVE_STUDIO_8000_ANNUAL", "studio-8000-annual", "Studio 8,000 credits annual", 181440, "year"],
      ["PADDLE_PRICE_CREATIVE_STUDIO_16000_MONTHLY", "studio-16000-monthly", "Studio 16,000 credits monthly", 34900, "month"],
      ["PADDLE_PRICE_CREATIVE_STUDIO_16000_ANNUAL", "studio-16000-annual", "Studio 16,000 credits annual", 335040, "year"],
    ],
  },
  {
    key: "agent-launch",
    name: "OpenCreative Agents Launch",
    description: "Three deployed agents with 150 included agent minutes.",
    prices: [
      ["PADDLE_PRICE_AGENT_LAUNCH_MONTHLY", "agent-launch-monthly", "Agents Launch monthly", 2900, "month"],
      ["PADDLE_PRICE_AGENT_LAUNCH_ANNUAL", "agent-launch-annual", "Agents Launch annual", 27840, "year"],
    ],
  },
  {
    key: "agent-growth",
    name: "OpenCreative Agents Growth",
    description: "Ten deployed agents with 650 included agent minutes.",
    prices: [
      ["PADDLE_PRICE_AGENT_GROWTH_MONTHLY", "agent-growth-monthly", "Agents Growth monthly", 9900, "month"],
      ["PADDLE_PRICE_AGENT_GROWTH_ANNUAL", "agent-growth-annual", "Agents Growth annual", 95040, "year"],
    ],
  },
  {
    key: "agent-scale",
    name: "OpenCreative Agents Scale",
    description: "Thirty deployed agents with 1,800 included agent minutes.",
    prices: [
      ["PADDLE_PRICE_AGENT_SCALE_MONTHLY", "agent-scale-monthly", "Agents Scale monthly", 29900, "month"],
      ["PADDLE_PRICE_AGENT_SCALE_ANNUAL", "agent-scale-annual", "Agents Scale annual", 287040, "year"],
    ],
  },
  {
    key: "credit-topups",
    name: "OpenCreative Credit Top-ups",
    description: "One-off managed-credit bundles for active OpenCreative workspaces.",
    prices: [
      ["PADDLE_PRICE_CREDITS_250", "credits-250", "250 managed credits", 1500, null],
      ["PADDLE_PRICE_CREDITS_500", "credits-500", "500 managed credits", 2900, null],
      ["PADDLE_PRICE_CREDITS_1000", "credits-1000", "1,000 managed credits", 5500, null],
    ],
  },
];

async function all(collection) {
  const rows = [];
  for await (const row of collection) rows.push(row);
  return rows;
}

const existingProducts = await all(paddle.products.list({ status: ["active"], perPage: 200 }));
const existingPrices = await all(paddle.prices.list({ status: ["active"], perPage: 200 }));
const env = {};

for (const definition of catalog) {
  let product = existingProducts.find((entry) => entry.customData?.catalog_key === definition.key);
  product ||= await paddle.products.create({
    name: definition.name,
    description: definition.description,
    taxCategory: "saas",
    customData: { catalog_key: definition.key },
  });

  for (const [envName, priceKey, description, amount, interval] of definition.prices) {
    let price = existingPrices.find((entry) => entry.customData?.catalog_key === priceKey);
    price ||= await paddle.prices.create({
      productId: product.id,
      description,
      unitPrice: { amount: String(amount), currencyCode: "USD" },
      billingCycle: interval ? { interval, frequency: 1 } : null,
      taxMode: "account_setting",
      customData: { catalog_key: priceKey },
    });
    env[envName] = price.id;
  }
}

const clientTokens = await all(paddle.clientTokens.list({ status: ["active"], perPage: 200 }));
let clientToken = clientTokens.find((entry) => entry.name === "OpenCreative production checkout");
clientToken ||= await paddle.clientTokens.create({
  name: "OpenCreative production checkout",
  description: "Production Paddle.js token for www.opencreativehq.com",
});

const notificationUrl = "https://www.opencreativehq.com/api/webhooks/paddle";
const notificationSettings = await paddle.notificationSettings.list();
let notification = notificationSettings.find((entry) => entry.destination === notificationUrl);
notification ||= await paddle.notificationSettings.create({
  description: "OpenCreative production",
  destination: notificationUrl,
  type: "url",
  subscribedEvents: [
    "customer.created",
    "customer.updated",
    "subscription.created",
    "subscription.updated",
    "subscription.activated",
    "subscription.past_due",
    "subscription.paused",
    "subscription.resumed",
    "subscription.canceled",
    "transaction.completed",
  ],
});

if (!clientToken.token) throw new Error("The production client token could not be read.");
if (!notification.endpointSecretKey) throw new Error("The production webhook secret could not be read.");

const result = {
  ...env,
  NEXT_PUBLIC_PADDLE_CLIENT_TOKEN: clientToken.token,
  NEXT_PUBLIC_PADDLE_ENV: "production",
  PADDLE_NOTIFICATION_WEBHOOK_SECRET: notification.endpointSecretKey,
  PADDLE_NOTIFICATION_DESTINATION_ID: notification.id,
};

await writeFile(outputPath, `${JSON.stringify(result, null, 2)}\n`, { mode: 0o600 });
await chmod(outputPath, 0o600);
console.log(`Synchronized ${Object.keys(env).length} live prices and the production webhook destination.`);
