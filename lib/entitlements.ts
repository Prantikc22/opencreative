export type ProductFamily = "creative" | "agents";

type WorkspaceWithEntitlements = {
  plan?: string | null;
  product_entitlements?: unknown;
};

export function productEntitlements(workspace: WorkspaceWithEntitlements | null | undefined) {
  const entitlements: Record<ProductFamily, string> = {
    creative: "free",
    agents: "agent-sandbox",
  };
  const stored = workspace?.product_entitlements;
  if (stored && typeof stored === "object" && !Array.isArray(stored)) {
    const record = stored as Record<string, unknown>;
    if (typeof record.creative === "string" && record.creative)
      entitlements.creative = record.creative;
    if (typeof record.agents === "string" && record.agents)
      entitlements.agents = record.agents;
  }
  const plan = workspace?.plan;
  if (plan?.startsWith("agent-")) entitlements.agents = plan;
  else if (plan) entitlements.creative = plan;
  return entitlements;
}

export function hasProductEntitlement(workspace: WorkspaceWithEntitlements | null | undefined, family: ProductFamily) {
  return Boolean(productEntitlements(workspace)[family]);
}
