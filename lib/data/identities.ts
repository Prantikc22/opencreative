import { getWorkspaceContext } from "@/lib/workspace";
export async function campaignIdentityData() {
  const { supabase, workspaceId } = await getWorkspaceContext();
  const [{ data: brands }, { data: products }, { data: avatars }] =
    await Promise.all([
      supabase
        .from("brands")
        .select("id,name")
        .eq("workspace_id", workspaceId)
        .order("name"),
      supabase
        .from("products")
        .select("id,name")
        .eq("workspace_id", workspaceId)
        .order("name"),
      supabase
        .from("avatars")
        .select("id,name")
        .eq("workspace_id", workspaceId)
        .order("name"),
    ]);
  return {
    brands: brands || [],
    products: products || [],
    avatars: avatars || [],
  };
}
