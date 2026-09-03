import type { Metadata } from "next";
import { AgentStudio } from "@/components/studio/agent-studio";
import { ProductEntitlementRequired } from "@/components/product-entitlement-required";
import { hasProductEntitlement } from "@/lib/entitlements";
import { getWorkspaceContext } from "@/lib/workspace";

export const metadata: Metadata = { title: "Agent Studio" };

export default async function Page() {
  const { workspace } = await getWorkspaceContext();
  if (!hasProductEntitlement(workspace, "agents")) return <ProductEntitlementRequired family="agents" />;
  return <AgentStudio />;
}
