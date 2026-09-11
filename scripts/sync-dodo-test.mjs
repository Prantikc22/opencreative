import { chmod, writeFile } from "node:fs/promises";
import DodoPayments from "dodopayments";

const apiKey = process.env.DODO_PAYMENTS_API_KEY;
const outputPath = process.env.DODO_SYNC_OUTPUT || ".env.dodo.generated";
const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://www.opencreativehq.com").replace(/\/$/, "");
if (!apiKey) throw new Error("DODO_PAYMENTS_API_KEY is required.");

const client = new DodoPayments({ bearerToken: apiKey, environment: "test_mode" });
const annual = (monthly) => Math.round(monthly * 12 * 0.8);
const plans = [
  ["DODO_PRODUCT_CREATIVE_STARTER_MONTHLY", "starter-monthly", "OpenCreative Starter — monthly", 900, "Month", "creative", "starter", 250],
  ["DODO_PRODUCT_CREATIVE_CREATOR_MONTHLY", "creator-monthly", "OpenCreative Creator — monthly", 1900, "Month", "creative", "creator", 750],
  ["DODO_PRODUCT_CREATIVE_CREATOR_ANNUAL", "creator-annual", "OpenCreative Creator — annual", annual(1900), "Year", "creative", "creator", 750],
  ["DODO_PRODUCT_CREATIVE_PRO_MONTHLY", "pro-monthly", "OpenCreative Pro 1,900 — monthly", 4900, "Month", "creative", "pro", 1900],
  ["DODO_PRODUCT_CREATIVE_PRO_ANNUAL", "pro-annual", "OpenCreative Pro 1,900 — annual", annual(4900), "Year", "creative", "pro", 1900],
  ["DODO_PRODUCT_CREATIVE_PRO_2700_MONTHLY", "pro-2700-monthly", "OpenCreative Pro 2,700 — monthly", 6900, "Month", "creative", "pro", 2700],
  ["DODO_PRODUCT_CREATIVE_PRO_2700_ANNUAL", "pro-2700-annual", "OpenCreative Pro 2,700 — annual", annual(6900), "Year", "creative", "pro", 2700],
  ["DODO_PRODUCT_CREATIVE_PRO_3500_MONTHLY", "pro-3500-monthly", "OpenCreative Pro 3,500 — monthly", 8900, "Month", "creative", "pro", 3500],
  ["DODO_PRODUCT_CREATIVE_PRO_3500_ANNUAL", "pro-3500-annual", "OpenCreative Pro 3,500 — annual", annual(8900), "Year", "creative", "pro", 3500],
  ["DODO_PRODUCT_CREATIVE_STUDIO_MONTHLY", "studio-monthly", "OpenCreative Studio 4,000 — monthly", 9900, "Month", "creative", "studio", 4000],
  ["DODO_PRODUCT_CREATIVE_STUDIO_ANNUAL", "studio-annual", "OpenCreative Studio 4,000 — annual", annual(9900), "Year", "creative", "studio", 4000],
  ["DODO_PRODUCT_CREATIVE_STUDIO_8000_MONTHLY", "studio-8000-monthly", "OpenCreative Studio 8,000 — monthly", 18900, "Month", "creative", "studio", 8000],
  ["DODO_PRODUCT_CREATIVE_STUDIO_8000_ANNUAL", "studio-8000-annual", "OpenCreative Studio 8,000 — annual", annual(18900), "Year", "creative", "studio", 8000],
  ["DODO_PRODUCT_CREATIVE_STUDIO_16000_MONTHLY", "studio-16000-monthly", "OpenCreative Studio 16,000 — monthly", 34900, "Month", "creative", "studio", 16000],
  ["DODO_PRODUCT_CREATIVE_STUDIO_16000_ANNUAL", "studio-16000-annual", "OpenCreative Studio 16,000 — annual", annual(34900), "Year", "creative", "studio", 16000],
  ["DODO_PRODUCT_AGENT_LAUNCH_MONTHLY", "agent-launch-monthly", "OpenCreative Agents Launch — monthly", 2900, "Month", "agents", "agent-launch", 0],
  ["DODO_PRODUCT_AGENT_LAUNCH_ANNUAL", "agent-launch-annual", "OpenCreative Agents Launch — annual", annual(2900), "Year", "agents", "agent-launch", 0],
  ["DODO_PRODUCT_AGENT_GROWTH_MONTHLY", "agent-growth-monthly", "OpenCreative Agents Growth — monthly", 9900, "Month", "agents", "agent-growth", 0],
  ["DODO_PRODUCT_AGENT_GROWTH_ANNUAL", "agent-growth-annual", "OpenCreative Agents Growth — annual", annual(9900), "Year", "agents", "agent-growth", 0],
  ["DODO_PRODUCT_AGENT_SCALE_MONTHLY", "agent-scale-monthly", "OpenCreative Agents Scale — monthly", 29900, "Month", "agents", "agent-scale", 0],
  ["DODO_PRODUCT_AGENT_SCALE_ANNUAL", "agent-scale-annual", "OpenCreative Agents Scale — annual", annual(29900), "Year", "agents", "agent-scale", 0],
];
const topups = [
  ["DODO_PRODUCT_CREDITS_250", "credits-250", "OpenCreative — 250 credit top-up", 1500, 250],
  ["DODO_PRODUCT_CREDITS_500", "credits-500", "OpenCreative — 500 credit top-up", 2900, 500],
  ["DODO_PRODUCT_CREDITS_1000", "credits-1000", "OpenCreative — 1,000 credit top-up", 5500, 1000],
];

const existing = [];
for await (const product of client.products.list({ archived: false, page_size: 100 })) existing.push(product);
const byCatalogKey = new Map(existing.map((product) => [String(product.metadata?.opencreative_catalog_key || ""), product]));
const env = {};

for (const [envName, key, name, price, interval, family, plan, credits] of plans) {
  let product = byCatalogKey.get(key);
  if (!product) {
    product = await client.products.create({
      name,
      description: family === "creative"
        ? `${credits.toLocaleString()} managed OpenCreative credits per billing period.`
        : `${name.replace("OpenCreative ", "")} subscription for deployed voice and text agents.`,
      tax_category: "saas",
      metadata: { opencreative_catalog_key: key, family, plan, credits, cadence: interval === "Year" ? "annual" : "monthly" },
      price: {
        type: "recurring_price",
        currency: "USD",
        price,
        payment_frequency_count: 1,
        payment_frequency_interval: interval,
        subscription_period_count: 1,
        subscription_period_interval: interval,
        purchasing_power_parity: false,
        tax_inclusive: false,
      },
    });
    byCatalogKey.set(key, product);
    console.log(`Created ${name}`);
  }
  env[envName] = product.product_id;
}

for (const [envName, key, name, price, credits] of topups) {
  let product = byCatalogKey.get(key);
  if (!product) {
    product = await client.products.create({
      name,
      description: `${credits.toLocaleString()} non-expiring managed credits for OpenCreative.`,
      tax_category: "saas",
      metadata: { opencreative_catalog_key: key, family: "creative", plan: "top-up", credits, cadence: "one-time" },
      price: { type: "one_time_price", currency: "USD", price, purchasing_power_parity: false, tax_inclusive: false },
    });
    byCatalogKey.set(key, product);
    console.log(`Created ${name}`);
  }
  env[envName] = product.product_id;
}

const webhookUrl = `${appUrl}/api/webhooks/dodo`;
const webhooks = [];
for await (const webhook of client.webhooks.list()) webhooks.push(webhook);
let webhook = webhooks.find((candidate) => candidate.url === webhookUrl);
if (!webhook) {
  const previous = webhooks.find((candidate) => {
    try { return new URL(candidate.url).pathname === "/api/webhooks/dodo"; }
    catch { return false; }
  });
  if (previous) webhook = await client.webhooks.update(previous.id, { url: webhookUrl, disabled: false });
}
if (!webhook) {
  webhook = await client.webhooks.create({
    url: webhookUrl,
    description: "OpenCreative test billing events",
    filter_types: [
      "payment.succeeded", "payment.failed", "payment.cancelled",
      "subscription.active", "subscription.renewed", "subscription.updated",
      "subscription.plan_changed", "subscription.past_due", "subscription.on_hold",
      "subscription.paused", "subscription.unpaused", "subscription.cancelled",
      "subscription.failed", "subscription.expired", "refund.succeeded",
    ],
    metadata: { application: "opencreative", environment: "test_mode" },
  });
  console.log(`Created webhook ${webhookUrl}`);
}
const webhookSecret = await client.webhooks.retrieveSecret(webhook.id);

const values = {
  DODO_PAYMENTS_API_KEY: apiKey,
  DODO_PAYMENTS_ENVIRONMENT: "test_mode",
  DODO_PAYMENTS_WEBHOOK_KEY: webhookSecret.secret,
  DODO_PAYMENTS_WEBHOOK_ID: webhook.id,
  DODO_PAYMENTS_RETURN_URL: `${appUrl}/account/credits?checkout=success`,
  ...env,
};
await writeFile(outputPath, `${Object.entries(values).map(([key, value]) => `${key}=${value}`).join("\n")}\n`, { mode: 0o600 });
await chmod(outputPath, 0o600);
console.log(`Dodo test catalog ready: ${plans.length + topups.length} products and one signed webhook.`);
console.log(`Environment values written to ${outputPath}.`);
