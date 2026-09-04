"use server";

import { getPaddle } from "@/lib/paddle/server";
import { getWorkspaceContext } from "@/lib/workspace";
import { createAdminClient } from "@/lib/supabase/admin";

export async function createBillingPortalSession() {
  const { user, supabase, workspaceId } = await getWorkspaceContext();
  const { data: customer } = await supabase
    .from("billing_customers")
    .select("provider_customer_id")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .maybeSingle();
  let customerId = customer?.provider_customer_id || "";
  if (!customerId && user.email) {
    for await (const candidate of getPaddle().customers.list({ email: [user.email], perPage: 10 })) {
      customerId = candidate.id;
      break;
    }
    if (customerId) {
      const { error } = await createAdminClient().from("billing_customers").upsert({
        provider_customer_id: customerId,
        workspace_id: workspaceId,
        user_id: user.id,
        email: user.email,
        metadata: { recovered_from: "customer_email" },
      });
      if (error) throw error;
    }
  }
  if (!customerId) return { error: "No completed Paddle checkout was found for this account." };

  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select("provider_subscription_id")
    .eq("workspace_id", workspaceId)
    .not("provider_subscription_id", "is", null);
  const ids = (subscriptions || []).map((item) => item.provider_subscription_id).filter(Boolean) as string[];
  const session = await getPaddle().customerPortalSessions.create(customerId, ids);
  return { url: session.urls.general.overview };
}
