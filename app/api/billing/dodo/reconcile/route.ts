import { NextResponse } from "next/server";
import { z } from "zod";
import { dodoPurchase, dodoPurchaseForProduct, getDodoPayments, type BillingCadence } from "@/lib/dodo/server";
import { persistDodoSubscription } from "@/lib/dodo/subscription-sync";
import { createAdminClient } from "@/lib/supabase/admin";
import { getWorkspaceContext } from "@/lib/workspace";

export const runtime = "nodejs";
export const maxDuration = 15;

const reconcileSchema = z.object({
  subscriptionId: z.string().min(5).max(100).optional(),
});

function metadataValue(metadata: Record<string, unknown>, key: string) {
  const value = metadata[key];
  return value === undefined || value === null ? "" : String(value);
}

export async function POST(request: Request) {
  try {
    const { subscriptionId } = reconcileSchema.parse(await request.json());
    const { workspaceId, user } = await getWorkspaceContext();
    const admin = createAdminClient();
    let subscription;
    if (subscriptionId) {
      subscription = await getDodoPayments().subscriptions.retrieve(subscriptionId);
    } else {
      const { data: billingCustomer, error: customerError } = await admin
        .from("billing_customers")
        .select("provider_customer_id")
        .eq("workspace_id", workspaceId)
        .eq("user_id", user.id)
        .eq("provider", "dodo")
        .maybeSingle();
      if (customerError) throw customerError;
      if (!billingCustomer?.provider_customer_id) {
        return NextResponse.json({ error: "No Dodo Payments customer was found." }, { status: 404 });
      }
      const subscriptions = await getDodoPayments().subscriptions.list({
        customer_id: billingCustomer.provider_customer_id,
        status: "active",
        page_size: 100,
      });
      subscription = subscriptions.items.find((candidate) => {
        const match = dodoPurchaseForProduct(candidate.product_id);
        return match?.purchaseType === "subscription" && match.family === "creative";
      });
      if (!subscription) {
        return NextResponse.json({ error: "No active Creative subscription was found." }, { status: 404 });
      }
    }
    const metadata = (subscription.metadata || {}) as Record<string, unknown>;

    if (metadataValue(metadata, "workspace_id") !== workspaceId || metadataValue(metadata, "user_id") !== user.id) {
      return NextResponse.json({ error: "This subscription does not belong to the current workspace." }, { status: 403 });
    }

    const cadence = metadataValue(metadata, "cadence") as BillingCadence;
    const itemId = metadataValue(metadata, "item_id");
    const purchase = dodoPurchaseForProduct(subscription.product_id) || (itemId ? dodoPurchase(itemId, cadence) : null);
    if (!purchase || purchase.purchaseType !== "subscription" || purchase.family !== "creative") {
      return NextResponse.json({ error: "This is not a Creative subscription." }, { status: 400 });
    }
    const active = ["active", "past_due"].includes(subscription.status);

    const customerId = subscription.customer?.customer_id || null;
    await persistDodoSubscription(admin, {
      workspace_id: workspaceId,
      provider: "dodo",
      provider_customer_id: customerId,
      provider_subscription_id: subscription.subscription_id,
      plan: purchase.planId,
      status: subscription.status,
      current_period_start: subscription.previous_billing_date || null,
      current_period_end: subscription.next_billing_date || null,
      cancel_at_period_end: Boolean(subscription.cancel_at_next_billing_date),
      price_id: null,
      product_id: purchase.productId,
      currency_code: subscription.currency || null,
      next_billed_at: subscription.next_billing_date || null,
      scheduled_change: { cancel_at_next_billing_date: Boolean(subscription.cancel_at_next_billing_date) },
      items: [{ product_id: purchase.productId, quantity: subscription.quantity || 1 }],
      metadata: { source: "checkout_return_reconciliation", family: purchase.family, cadence: purchase.cadence },
    });

    const { data: workspace, error: workspaceError } = await admin
      .from("workspaces")
      .select("product_entitlements")
      .eq("id", workspaceId)
      .single();
    if (workspaceError) throw workspaceError;
    const entitlements = (workspace?.product_entitlements || {}) as Record<string, string | null>;
    const { error: planError } = await admin
      .from("workspaces")
      .update({
        plan: active ? purchase.planId : "free",
        product_entitlements: { ...entitlements, creative: active ? purchase.planId : null },
      })
      .eq("id", workspaceId);
    if (planError) throw planError;

    return NextResponse.json({ reconciled: true, plan: active ? purchase.planId : "free", status: subscription.status });
  } catch (cause) {
    if (cause instanceof z.ZodError) return NextResponse.json({ error: "Invalid subscription." }, { status: 400 });
    console.error("Dodo subscription reconciliation error", cause);
    return NextResponse.json({ error: "Could not confirm the subscription." }, { status: 500 });
  }
}
