"use server";

import { getPaddle } from "@/lib/paddle/server";
import { getWorkspaceContext } from "@/lib/workspace";

export async function createBillingPortalSession() {
  const { user, supabase, workspaceId } = await getWorkspaceContext();
  const { data: customer } = await supabase
    .from("billing_customers")
    .select("provider_customer_id")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!customer?.provider_customer_id) return { error: "Complete a checkout first to open billing management." };

  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select("provider_subscription_id")
    .eq("workspace_id", workspaceId)
    .not("provider_subscription_id", "is", null);
  const ids = (subscriptions || []).map((item) => item.provider_subscription_id).filter(Boolean) as string[];
  const session = await getPaddle().customerPortalSessions.create(customer.provider_customer_id, ids);
  return { url: session.urls.general.overview };
}
