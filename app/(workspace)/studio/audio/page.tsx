import type { Metadata } from "next";
import { AudioStudio } from "@/components/studio/audio-studio";
import { ProductEntitlementRequired } from "@/components/product-entitlement-required";
import { hasProductEntitlement } from "@/lib/entitlements";
import { getWorkspaceContext } from "@/lib/workspace";
export const metadata: Metadata = { title: "Audio Studio" };
export default async function Page() {
  const { workspace } = await getWorkspaceContext();
  if (!hasProductEntitlement(workspace, "creative")) return <ProductEntitlementRequired family="creative" />;
  return <AudioStudio />;
}
