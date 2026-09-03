import { writeFile } from "node:fs/promises";
import { Paddle, Environment } from "@paddle/paddle-node-sdk";

const apiKey = process.env.PADDLE_API_KEY;
if (!apiKey) throw new Error("PADDLE_API_KEY is required.");

const paddle = new Paddle(apiKey, { environment: Environment.sandbox });
const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://opencreative.vercel.app").replace(/\/$/, "");

const catalog = [
  ["starter", "OpenCreative Starter", 900, 8640, "250 managed creative credits each month"],
  ["creator", "OpenCreative Creator", 1900, 18240, "750 managed creative credits each month"],
  ["pro", "OpenCreative Pro", 4900, 47040, "1,900 managed creative credits each month"],
  ["studio", "OpenCreative Studio", 9900, 95040, "4,000 managed creative credits each month"],
  ["agent-launch", "OpenCreative Agent Launch", 2900, 27840, "150 customer-agent minutes each month"],
  ["agent-growth", "OpenCreative Agent Growth", 9900, 95040, "650 customer-agent minutes each month"],
  ["agent-scale", "OpenCreative Agent Scale", 29900, 287040, "1,800 customer-agent minutes each month"],
];
const bundles = [
  ["credits-250", "OpenCreative 250-credit top-up", 1500, "250 additional managed credits"],
  ["credits-500", "OpenCreative 500-credit top-up", 2900, "500 additional managed credits"],
  ["credits-1000", "OpenCreative 1,000-credit top-up", 5500, "1,000 additional managed credits"],
];

const products = [];
for await (const product of paddle.products.list({ perPage: 200 })) products.push(product);
const prices = [];
for await (const price of paddle.prices.list({ perPage: 200 })) prices.push(price);

async function ensureProduct(key, name, description) {
  let product = products.find((item) => item.customData?.opencreative_key === key);
  if (!product) {
    product = await paddle.products.create({
      name,
      description,
      taxCategory: "saas",
      customData: { opencreative_key: key },
    });
    products.push(product);
  }
  return product;
}

async function ensurePrice(product, key, cadence, amount, description) {
  const priceKey = `${key}:${cadence}`;
  let price = prices.find((item) => item.customData?.opencreative_key === priceKey);
  if (!price) {
    price = await paddle.prices.create({
      productId: product.id,
      name: `${product.name} · ${cadence}`,
      description,
      unitPrice: { amount: String(amount), currencyCode: "USD" },
      billingCycle: cadence === "monthly" ? { interval: "month", frequency: 1 } : cadence === "annual" ? { interval: "year", frequency: 1 } : null,
      taxMode: "account_setting",
      customData: { opencreative_key: priceKey },
    });
    prices.push(price);
  }
  return price;
}

const env = {};
for (const [key, name, monthly, annual, description] of catalog) {
  const product = await ensureProduct(key, name, description);
  const monthlyPrice = await ensurePrice(product, key, "monthly", monthly, description);
  const annualPrice = await ensurePrice(product, key, "annual", annual, description);
  const envKey = key.toUpperCase().replaceAll("-", "_");
  env[`PADDLE_PRICE_${envKey}_MONTHLY`] = monthlyPrice.id;
  env[`PADDLE_PRICE_${envKey}_ANNUAL`] = annualPrice.id;
}
for (const [key, name, amount, description] of bundles) {
  const product = await ensureProduct(key, name, description);
  const price = await ensurePrice(product, key, "one-time", amount, description);
  env[`PADDLE_PRICE_${key.toUpperCase().replaceAll("-", "_")}`] = price.id;
}

const tokens = [];
for await (const token of paddle.clientTokens.list({ perPage: 200 })) tokens.push(token);
let clientToken = tokens.find((item) => item.name === "OpenCreative web checkout" && item.status === "active");
if (!clientToken) clientToken = await paddle.clientTokens.create({ name: "OpenCreative web checkout", description: "Paddle.js token for OpenCreative Cloud" });
env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN = clientToken.token;

const destinations = await paddle.notificationSettings.list({ perPage: 200 });
const destinationUrl = `${appUrl}/api/webhooks/paddle`;
let destination = destinations.find((item) => item.destination === destinationUrl);
if (!destination) {
  destination = await paddle.notificationSettings.create({
    description: "OpenCreative billing sync",
    destination: destinationUrl,
    type: "url",
    subscribedEvents: [
      "transaction.completed",
      "subscription.created",
      "subscription.updated",
      "subscription.canceled",
      "subscription.past_due",
    ],
  });
}
env.PADDLE_NOTIFICATION_WEBHOOK_SECRET = destination.endpointSecretKey;

const lines = Object.entries(env).map(([key, value]) => `${key}=${value}`);
await writeFile(".env.paddle.generated", `${lines.join("\n")}\n`, { mode: 0o600 });
console.log(`Paddle sandbox catalog ready: ${catalog.length * 2 + bundles.length} prices and one signed webhook destination.`);
