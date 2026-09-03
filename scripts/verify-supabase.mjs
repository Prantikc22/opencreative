const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceRole) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");

const checks = [
  ["workspaces", "id,plan,product_entitlements"],
  ["credit_wallets", "workspace_id,balance,lifetime_granted"],
  ["credit_transactions", "id,transaction_type,status,balance_after"],
  ["subscriptions", "id,provider_subscription_id,price_id,items"],
  ["billing_customers", "provider_customer_id,workspace_id,email"],
  ["billing_webhook_events", "event_id,event_type,processed_at"],
  ["profiles", "id,welcome_email_sent_at"],
  ["support_tickets", "id,last_reply,last_replied_at"],
  ["workspace_api_keys", "id,workspace_id,token_prefix"],
  ["affiliate_accounts", "id,workspace_id,code"],
];

const failed = [];
for (const [table, select] of checks) {
  const response = await fetch(`${url}/rest/v1/${table}?select=${encodeURIComponent(select)}&limit=1`, {
    headers: { apikey: serviceRole, Authorization: `Bearer ${serviceRole}` },
  });
  if (!response.ok) failed.push(`${table}: ${response.status}`);
}

if (failed.length) {
  console.error(`Supabase schema verification failed (${failed.join(", ")}). Run supabase/OPENCREATIVE_PENDING_MIGRATIONS.sql, then retry.`);
  process.exit(1);
}
console.log(`Supabase schema verified: ${checks.length} tenant, billing, support, MCP, and affiliate surfaces are queryable.`);
