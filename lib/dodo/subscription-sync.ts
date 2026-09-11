import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

type AdminClient = ReturnType<typeof createAdminClient>;
type SubscriptionRow = Record<string, unknown> & { provider_subscription_id: string };

export async function persistDodoSubscription(admin: AdminClient, payload: SubscriptionRow) {
  const { data: existing, error: lookupError } = await admin
    .from("subscriptions")
    .select("id")
    .eq("provider_subscription_id", payload.provider_subscription_id)
    .eq("provider", "dodo")
    .maybeSingle();
  if (lookupError) throw lookupError;

  if (existing?.id) {
    const { error } = await admin.from("subscriptions").update(payload).eq("id", existing.id);
    if (error) throw error;
    return;
  }

  const { error: insertError } = await admin.from("subscriptions").insert(payload);
  if (!insertError) return;
  if (insertError.code !== "23505") throw insertError;

  // A concurrent webhook may have inserted the same provider subscription.
  const { error: retryError } = await admin
    .from("subscriptions")
    .update(payload)
    .eq("provider_subscription_id", payload.provider_subscription_id)
    .eq("provider", "dodo");
  if (retryError) throw retryError;
}
