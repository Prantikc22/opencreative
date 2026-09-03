import type { Metadata } from "next";
import { CreativeStudio } from "@/components/studio/creative-studio";
import { ProductEntitlementRequired } from "@/components/product-entitlement-required";
import { hasProductEntitlement } from "@/lib/entitlements";
import { getWorkspaceContext } from "@/lib/workspace";
export const metadata: Metadata = { title: "Image Studio" };
export default async function Page() {
  const { workspace } = await getWorkspaceContext();
  if (!hasProductEntitlement(workspace, "creative")) return <ProductEntitlementRequired family="creative" />;
  return <CreativeStudio mode="image" />;
}
