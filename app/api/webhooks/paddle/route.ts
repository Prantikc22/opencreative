import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPaddle, paddlePriceId } from "@/lib/paddle/server";
import { pricingPlans } from "@/lib/pricing";
import { escapeHtml, sendEmail } from "@/lib/email/resend";

export const runtime = "nodejs";
export const maxDuration = 10;

type PaddleData = Record<string, unknown> & {
  id?: string;
  status?: string;
  email?: string;
  items?: Array<{ price?: { id?: string; productId?: string; product_id?: string }; price_id?: string }>;
  customData?: Record<string, string>;
  custom_data?: Record<string, string>;
  customerId?: string;
  customer_id?: string;
  currencyCode?: string;
  currency_code?: string;
  nextBilledAt?: string;
  next_billed_at?: string;
  currentBillingPeriod?: { startsAt?: string; endsAt?: string };
  current_billing_period?: { starts_at?: string; ends_at?: string };
  scheduledChange?: { action?: string } | null;
  scheduled_change?: { action?: string } | null;
  details?: { totals?: { total?: string } };
};

const creditPrices = new Map([
  [paddlePriceId("credits-250", "one-time"), 250],
  [paddlePriceId("credits-500", "one-time"), 500],
  [paddlePriceId("credits-1000", "one-time"), 1000],
].filter(([id]) => Boolean(id)) as [string, number][]);

const planPrices = new Map<string, string>();
for (const plan of pricingPlans.filter((item) => item.monthlyPrice > 0 && !item.custom)) {
  for (const cadence of ["monthly", "annual"] as const) {
    const id = paddlePriceId(plan.id, cadence);
    if (id) planPrices.set(id, plan.id);
  }
}
for (const plan of ["agent-launch", "agent-growth", "agent-scale"]) {
  for (const cadence of ["monthly", "annual"] as const) {
    const id = paddlePriceId(plan, cadence);
    if (id) planPrices.set(id, plan);
  }
}

function itemPriceId(data: PaddleData) {
  return data.items?.[0]?.price?.id || data.items?.[0]?.price_id || "";
}

async function setProductEntitlement(
  admin: ReturnType<typeof createAdminClient>,
  workspaceId: string,
  family: "creative" | "agents",
  plan: string | null,
) {
  const { data: workspace, error: readError } = await admin
    .from("workspaces")
    .select("product_entitlements")
    .eq("id", workspaceId)
    .single();
  if (readError) throw readError;
  const existing = (workspace?.product_entitlements || {}) as Record<string, string | null>;
  const { error } = await admin
    .from("workspaces")
    .update({ product_entitlements: { ...existing, [family]: plan } })
    .eq("id", workspaceId);
  if (error) throw error;
}

export async function POST(request: Request) {
  const signature = request.headers.get("paddle-signature") || "";
  const rawBody = await request.text();
  const secret = process.env.PADDLE_NOTIFICATION_WEBHOOK_SECRET || "";
  if (!signature || !rawBody || !secret)
    return NextResponse.json({ error: "Missing webhook signature, body, or destination secret." }, { status: 400 });
  try {
    const event = await getPaddle().webhooks.unmarshal(rawBody, secret, signature);
    const data = event.data as unknown as PaddleData;
    const type = String(event.eventType);
    const eventId = String(event.eventId);
    const custom = (data.customData || data.custom_data || {}) as Record<string, string>;
    let workspaceId = custom.workspace_id;
    const userId = custom.user_id || null;
    const admin = createAdminClient();
    const providerCustomerId = String(data.customerId || data.customer_id || "");
    let accountEmail = "";

    if (!workspaceId && providerCustomerId) {
      const { data: knownCustomer } = await admin
        .from("billing_customers")
        .select("workspace_id")
        .eq("provider_customer_id", providerCustomerId)
        .maybeSingle();
      workspaceId = String(knownCustomer?.workspace_id || "");
    }
    if (providerCustomerId && !accountEmail) {
      const { data: knownCustomer } = await admin.from("billing_customers").select("email").eq("provider_customer_id", providerCustomerId).maybeSingle();
      accountEmail = String(knownCustomer?.email || "");
    }

    if (workspaceId && userId && (data.customerId || data.customer_id)) {
      const { data: authUser } = await admin.auth.admin.getUserById(userId);
      if (authUser.user?.email) {
        accountEmail = authUser.user.email;
        const { error: customerError } = await admin.from("billing_customers").upsert({
          provider_customer_id: data.customerId || data.customer_id,
          workspace_id: workspaceId,
          user_id: userId,
          email: authUser.user.email,
          metadata: { event_id: eventId },
        });
        if (customerError) throw customerError;
      }
    }

    if (type === "transaction.completed") {
      const priceId = itemPriceId(data);
      const credits = creditPrices.get(priceId);
      if (credits && workspaceId) {
        const { error } = await admin.rpc("apply_paddle_credit_purchase", {
          p_event_id: eventId,
          p_event_type: type,
          p_workspace_id: workspaceId,
          p_user_id: userId,
          p_credits: credits,
          p_transaction_id: String(data.id || ""),
          p_payload: { price_id: priceId, total: data.details?.totals?.total, currency_code: data.currencyCode || data.currency_code },
        });
        if (error) throw error;
        if (accountEmail) void sendEmail({ to: accountEmail, subject: `${credits.toLocaleString()} credits added to your OpenCreative wallet`, html: `<p>Your payment was confirmed and <strong>${credits.toLocaleString()} credits</strong> were added to your OpenCreative wallet.</p><p><a href="${escapeHtml(process.env.NEXT_PUBLIC_APP_URL || "https://www.opencreativehq.com")}/account/credits">View Credits &amp; billing</a></p>` }).catch((cause) => console.error("Credit purchase email error", cause));
      } else if (workspaceId && planPrices.has(priceId) && !planPrices.get(priceId)?.startsWith("agent-")) {
        const plan = planPrices.get(priceId)!;
        const includedCredits = pricingPlans.find((item) => item.id === plan)?.credits || 0;
        const { error } = await admin.rpc("apply_paddle_subscription_payment", {
          p_event_id: eventId,
          p_workspace_id: workspaceId,
          p_user_id: userId,
          p_plan: plan,
          p_credits: includedCredits,
          p_transaction_id: String(data.id || ""),
          p_payload: { price_id: priceId, total: data.details?.totals?.total, currency_code: data.currencyCode || data.currency_code },
        });
        if (error) throw error;
        if (accountEmail) void sendEmail({ to: accountEmail, subject: `Your OpenCreative ${plan} plan is active`, html: `<p>Your <strong>${escapeHtml(plan)}</strong> plan is active with ${includedCredits.toLocaleString()} monthly credits.</p><p><a href="${escapeHtml(process.env.NEXT_PUBLIC_APP_URL || "https://www.opencreativehq.com")}/account/credits">Manage your plan</a></p>` }).catch((cause) => console.error("Plan purchase email error", cause));
      } else {
        await admin.from("billing_webhook_events").upsert({ event_id: eventId, event_type: type, payload: { transaction_id: data.id, ignored: true } });
      }
    }

    if (type.startsWith("customer.")) {
      if (workspaceId && data.email) {
        const { error } = await admin.from("billing_customers").upsert({
          provider_customer_id: String(data.id || ""),
          workspace_id: workspaceId,
          user_id: userId,
          email: String(data.email),
          metadata: { event_id: eventId },
        });
        if (error) throw error;
      }
    }

    if (type.startsWith("subscription.")) {
      const priceId = itemPriceId(data);
      const plan = planPrices.get(priceId);
      if (workspaceId && plan) {
        const isAgent = plan.startsWith("agent-");
        const payload = {
          workspace_id: workspaceId,
          provider: "paddle",
          provider_customer_id: data.customerId || data.customer_id,
          provider_subscription_id: String(data.id || ""),
          plan,
          status: data.status,
          current_period_start: data.currentBillingPeriod?.startsAt || data.current_billing_period?.starts_at || null,
          current_period_end: data.currentBillingPeriod?.endsAt || data.current_billing_period?.ends_at || null,
          cancel_at_period_end: (data.scheduledChange?.action || data.scheduled_change?.action) === "cancel",
          price_id: priceId,
          product_id: data.items?.[0]?.price?.productId || data.items?.[0]?.price?.product_id || null,
          currency_code: data.currencyCode || data.currency_code || null,
          next_billed_at: data.nextBilledAt || data.next_billed_at || null,
          scheduled_change: data.scheduledChange || data.scheduled_change || null,
          items: data.items || [],
          metadata: { event_id: eventId, family: isAgent ? "agents" : "creative" },
        };
        const { error } = await admin.from("subscriptions").upsert(payload, { onConflict: "provider_subscription_id" });
        if (error) throw error;
        const active = ["active", "trialing", "past_due"].includes(String(data.status));
        await setProductEntitlement(admin, workspaceId, isAgent ? "agents" : "creative", active ? plan : null);
        if (!isAgent && active) {
          const { error: planError } = await admin.from("workspaces").update({ plan }).eq("id", workspaceId);
          if (planError) throw planError;
        }
        if (accountEmail && (type === "subscription.updated" || type === "subscription.canceled")) {
          const canceled = !active || (data.scheduledChange?.action || data.scheduled_change?.action) === "cancel";
          void sendEmail({ to: accountEmail, subject: canceled ? "Your OpenCreative cancellation is scheduled" : `Your OpenCreative ${plan} plan was updated`, html: canceled ? `<p>Your ${escapeHtml(plan)} plan remains available through the current billing period, then access ends automatically.</p>` : `<p>Your ${escapeHtml(plan)} plan was updated successfully.</p>` }).catch((cause) => console.error("Subscription update email error", cause));
        }
      }
      await admin.from("billing_webhook_events").upsert({ event_id: eventId, event_type: type, payload: { subscription_id: data.id, price_id: priceId } });
    }
    return NextResponse.json({ received: true });
  } catch (cause) {
    console.error("Paddle webhook error", cause);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
