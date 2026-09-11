"use server";

import { billingAppUrl, getDodoPayments } from "@/lib/dodo/server";
import { getWorkspaceContext } from "@/lib/workspace";
import { createAdminClient } from "@/lib/supabase/admin";

export async function createBillingPortalSession() {
  const { user, supabase, workspaceId } = await getWorkspaceContext();
  const { data: customer } = await supabase
    .from("billing_customers")
    .select("provider_customer_id")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .eq("provider", "dodo")
    .maybeSingle();
  let customerId = customer?.provider_customer_id || "";
  if (!customerId && user.email) {
    for await (const candidate of getDodoPayments().customers.list({ email: user.email, page_size: 10 })) {
      customerId = candidate.customer_id;
      break;
    }
    if (customerId) {
      const { error } = await createAdminClient().from("billing_customers").upsert({
        provider_customer_id: customerId,
        workspace_id: workspaceId,
        user_id: user.id,
        email: user.email,
        provider: "dodo",
        metadata: { recovered_from: "customer_email" },
      });
      if (error) throw error;
    }
  }
  if (!customerId) return { error: "No completed Dodo Payments checkout was found for this account." };

  const session = await getDodoPayments().customers.customerPortal.create(customerId, {
    return_url: `${billingAppUrl()}/account/credits`,
  });
  return { url: session.link };
}
