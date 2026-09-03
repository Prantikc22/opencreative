export type ProductFamily = "creative" | "agents";

type WorkspaceWithEntitlements = {
  plan?: string | null;
  product_entitlements?: unknown;
};

export function productEntitlements(workspace: WorkspaceWithEntitlements | null | undefined) {
  const stored = workspace?.product_entitlements;
  if (stored && typeof stored === "object" && !Array.isArray(stored)) {
    const record = stored as Record<string, unknown>;
    return {
      creative: typeof record.creative === "string" ? record.creative : null,
      agents: typeof record.agents === "string" ? record.agents : null,
    };
  }
  const plan = workspace?.plan || "free";
  return plan.startsWith("agent-")
    ? { creative: null, agents: plan }
    : { creative: plan, agents: null };
}

export function hasProductEntitlement(workspace: WorkspaceWithEntitlements | null | undefined, family: ProductFamily) {
  return Boolean(productEntitlements(workspace)[family]);
}
