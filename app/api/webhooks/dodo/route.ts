import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { billingAppUrl, dodoPurchase, dodoPurchaseForProduct, getDodoPayments, type BillingCadence, type DodoPurchase } from "@/lib/dodo/server";
import { persistDodoSubscription } from "@/lib/dodo/subscription-sync";
import { escapeHtml, sendEmail } from "@/lib/email/resend";

export const runtime = "nodejs";
export const maxDuration = 15;

type Metadata = Record<string, string | number | boolean>;
type DodoData = Record<string, unknown> & {
  payment_id?: string;
  subscription_id?: string;
  product_id?: string;
  status?: string;
  currency?: string;
  total_amount?: number;
  previous_billing_date?: string;
  next_billing_date?: string;
  cancel_at_next_billing_date?: boolean;
  metadata?: Metadata;
  customer?: { customer_id?: string; email?: string; name?: string };
  product_cart?: Array<{ product_id?: string; quantity?: number }>;
};

function metadataValue(metadata: Metadata | undefined, key: string) {
  const value = metadata?.[key];
  return value === undefined || value === null ? "" : String(value);
}

function purchaseFromMetadata(metadata?: Metadata) {
  const itemId = metadataValue(metadata, "item_id");
  const cadence = metadataValue(metadata, "cadence") as BillingCadence;
  if (!itemId || !["monthly", "annual", "one-time"].includes(cadence)) return null;
  return dodoPurchase(itemId, cadence);
}

async function purchaseForEvent(data: DodoData) {
  const directProductId = data.product_id || data.product_cart?.[0]?.product_id || "";
  let purchase = directProductId ? dodoPurchaseForProduct(directProductId) : null;
  purchase ||= purchaseFromMetadata(data.metadata);
  if (!purchase && data.subscription_id) {
    const subscription = await getDodoPayments().subscriptions.retrieve(data.subscription_id);
    purchase = dodoPurchaseForProduct(subscription.product_id) || purchaseFromMetadata(subscription.metadata);
  }
  return purchase;
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

async function activateCreativePlan(
  admin: ReturnType<typeof createAdminClient>,
  workspaceId: string,
  plan: string,
) {
  await setProductEntitlement(admin, workspaceId, "creative", plan);
  const { error } = await admin.from("workspaces").update({ plan }).eq("id", workspaceId);
  if (error) throw error;
}

async function eventIdentity(admin: ReturnType<typeof createAdminClient>, data: DodoData) {
  const providerCustomerId = String(data.customer?.customer_id || "");
  let workspaceId = metadataValue(data.metadata, "workspace_id");
  let userId = metadataValue(data.metadata, "user_id") || null;
  let accountEmail = String(data.customer?.email || "");

  if ((!workspaceId || !userId || !accountEmail) && providerCustomerId) {
    const { data: knownCustomer } = await admin
      .from("billing_customers")
      .select("workspace_id,user_id,email")
      .eq("provider_customer_id", providerCustomerId)
      .eq("provider", "dodo")
      .maybeSingle();
    workspaceId ||= String(knownCustomer?.workspace_id || "");
    userId ||= knownCustomer?.user_id || null;
    accountEmail ||= String(knownCustomer?.email || "");
  }
  if (!workspaceId && data.subscription_id) {
    const { data: knownSubscription } = await admin
      .from("subscriptions")
      .select("workspace_id")
      .eq("provider_subscription_id", data.subscription_id)
      .eq("provider", "dodo")
      .maybeSingle();
    workspaceId = String(knownSubscription?.workspace_id || "");
  }
  return { providerCustomerId, workspaceId, userId, accountEmail };
}

async function rememberCustomer(
  admin: ReturnType<typeof createAdminClient>,
  identity: Awaited<ReturnType<typeof eventIdentity>>,
  eventId: string,
) {
  if (!identity.providerCustomerId || !identity.workspaceId || !identity.accountEmail) return;
  const { error } = await admin.from("billing_customers").upsert({
    provider_customer_id: identity.providerCustomerId,
    workspace_id: identity.workspaceId,
    user_id: identity.userId,
    email: identity.accountEmail,
    provider: "dodo",
    metadata: { event_id: eventId },
  });
  if (error) throw error;
}

async function grantSuccessfulPayment(
  admin: ReturnType<typeof createAdminClient>,
  data: DodoData,
  purchase: DodoPurchase | null,
  eventId: string,
  type: string,
  identity: Awaited<ReturnType<typeof eventIdentity>>,
) {
  if (!purchase || !identity.workspaceId) {
    const { error } = await admin.from("billing_webhook_events").upsert({
      event_id: eventId,
      event_type: type,
      provider: "dodo",
      payload: { payment_id: data.payment_id, ignored: true },
    });
    if (error) throw error;
    return;
  }

  const payload = {
    product_id: purchase.productId,
    total: data.total_amount,
    currency_code: data.currency,
    cadence: purchase.cadence,
  };
  if (purchase.purchaseType === "credit_topup") {
    const { error } = await admin.rpc("apply_dodo_credit_purchase", {
      p_event_id: eventId,
      p_event_type: type,
      p_workspace_id: identity.workspaceId,
      p_user_id: identity.userId,
      p_credits: purchase.credits,
      p_payment_id: String(data.payment_id || ""),
      p_payload: payload,
    });
    if (error) throw error;
    if (identity.accountEmail) void sendEmail({
      to: identity.accountEmail,
      subject: `${purchase.credits.toLocaleString()} credits added to your OpenCreative wallet`,
      html: `<p>Your payment was confirmed and <strong>${purchase.credits.toLocaleString()} credits</strong> were added to your OpenCreative wallet.</p><p><a href="${escapeHtml(billingAppUrl())}/account/credits">View Credits &amp; billing</a></p>`,
    }).catch((cause) => console.error("Credit purchase email error", cause));
    return;
  }

  if (purchase.family === "creative") {
    const { error } = await admin.rpc("apply_dodo_subscription_payment", {
      p_event_id: eventId,
      p_workspace_id: identity.workspaceId,
      p_user_id: identity.userId,
      p_plan: purchase.planId,
      p_credits: purchase.credits,
      p_payment_id: String(data.payment_id || ""),
      p_payload: payload,
    });
    if (error) throw error;
    // A successful recurring payment is sufficient to grant the purchased plan.
    // Do this here as well as in subscription.* handling because Dodo can deliver
    // the payment and subscription lifecycle events independently.
    await activateCreativePlan(admin, identity.workspaceId, purchase.planId);

    if (data.subscription_id) {
      const subscription = await getDodoPayments().subscriptions.retrieve(data.subscription_id);
      const subscriptionData = subscription as unknown as DodoData;
      const subscriptionIdentity = await eventIdentity(admin, subscriptionData);
      await syncSubscription(
        admin,
        subscriptionData,
        purchase,
        `${eventId}:subscription-sync`,
        "subscription.active",
        {
          providerCustomerId: subscriptionIdentity.providerCustomerId || identity.providerCustomerId,
          workspaceId: subscriptionIdentity.workspaceId || identity.workspaceId,
          userId: subscriptionIdentity.userId || identity.userId,
          accountEmail: subscriptionIdentity.accountEmail || identity.accountEmail,
        },
      );
    }
    if (identity.accountEmail) void sendEmail({
      to: identity.accountEmail,
      subject: `Your OpenCreative ${purchase.planId} plan is active`,
      html: `<p>Your <strong>${escapeHtml(purchase.planId)}</strong> plan is active with ${purchase.credits.toLocaleString()} recurring credits.</p><p><a href="${escapeHtml(billingAppUrl())}/account/credits">Manage your plan</a></p>`,
    }).catch((cause) => console.error("Plan purchase email error", cause));
  } else {
    const { error } = await admin.from("billing_webhook_events").upsert({
      event_id: eventId,
      event_type: type,
      provider: "dodo",
      payload: { payment_id: data.payment_id, product_id: purchase.productId },
    });
    if (error) throw error;
  }
}

async function syncSubscription(
  admin: ReturnType<typeof createAdminClient>,
  data: DodoData,
  purchase: DodoPurchase | null,
  eventId: string,
  type: string,
  identity: Awaited<ReturnType<typeof eventIdentity>>,
) {
  if (identity.workspaceId && purchase && data.subscription_id) {
    const active = ["active", "past_due"].includes(String(data.status));
    const payload = {
      workspace_id: identity.workspaceId,
      provider: "dodo",
      provider_customer_id: identity.providerCustomerId || null,
      provider_subscription_id: data.subscription_id,
      plan: purchase.planId,
      status: data.status || type.replace("subscription.", ""),
      current_period_start: data.previous_billing_date || null,
      current_period_end: data.next_billing_date || null,
      cancel_at_period_end: Boolean(data.cancel_at_next_billing_date),
      price_id: null,
      product_id: purchase.productId,
      currency_code: data.currency || null,
      next_billed_at: data.next_billing_date || null,
      scheduled_change: { cancel_at_next_billing_date: Boolean(data.cancel_at_next_billing_date) },
      items: [{ product_id: purchase.productId, quantity: 1 }],
      metadata: { event_id: eventId, family: purchase.family, cadence: purchase.cadence },
    };
    await persistDodoSubscription(admin, payload);
    await setProductEntitlement(admin, identity.workspaceId, purchase.family, active ? purchase.planId : null);
    if (purchase.family === "creative" && active) {
      await activateCreativePlan(admin, identity.workspaceId, purchase.planId);
    }
    if (identity.accountEmail && ["subscription.cancelled", "subscription.expired", "subscription.updated", "subscription.plan_changed"].includes(type)) {
      const cancelled = !active || Boolean(data.cancel_at_next_billing_date);
      void sendEmail({
        to: identity.accountEmail,
        subject: cancelled ? "Your OpenCreative subscription was canceled" : `Your OpenCreative ${purchase.planId} plan was updated`,
        html: cancelled
          ? `<p>Your ${escapeHtml(purchase.planId)} subscription has been canceled. Your Dodo Payments customer portal shows the effective date and any remaining access.</p>`
          : `<p>Your ${escapeHtml(purchase.planId)} plan was updated successfully.</p>`,
      }).catch((cause) => console.error("Subscription update email error", cause));
    }
  }
  const { error } = await admin.from("billing_webhook_events").upsert({
    event_id: eventId,
    event_type: type,
    provider: "dodo",
    payload: { subscription_id: data.subscription_id, product_id: data.product_id || purchase?.productId },
  });
  if (error) throw error;
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const webhookKey = process.env.DODO_PAYMENTS_WEBHOOK_KEY || "";
  if (!rawBody || !webhookKey) return NextResponse.json({ error: "Webhook verification is not configured." }, { status: 400 });

  try {
    const headers = Object.fromEntries(request.headers.entries());
    const event = getDodoPayments().webhooks.unwrap(rawBody, { headers, key: webhookKey });
    const data = event.data as unknown as DodoData;
    const type = String(event.type);
    const eventId = request.headers.get("webhook-id") || `${type}:${data.payment_id || data.subscription_id || event.timestamp}`;
    const admin = createAdminClient();
    const identity = await eventIdentity(admin, data);
    await rememberCustomer(admin, identity, eventId);
    const purchase = await purchaseForEvent(data);

    if (type === "payment.succeeded") await grantSuccessfulPayment(admin, data, purchase, eventId, type, identity);
    if (type.startsWith("subscription.")) await syncSubscription(admin, data, purchase, eventId, type, identity);
    if (!type.startsWith("subscription.") && type !== "payment.succeeded") {
      const { error } = await admin.from("billing_webhook_events").upsert({
        event_id: eventId,
        event_type: type,
        provider: "dodo",
        payload: { payment_id: data.payment_id, subscription_id: data.subscription_id },
      });
      if (error) throw error;
    }
    return NextResponse.json({ received: true });
  } catch (cause) {
    console.error("Dodo Payments webhook error", cause);
    return NextResponse.json({ error: "Webhook verification or processing failed." }, { status: 400 });
  }
}
