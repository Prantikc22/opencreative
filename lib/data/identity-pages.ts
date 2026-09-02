import { notFound } from "next/navigation";
import { getWorkspaceContext } from "@/lib/workspace";
export type IdentityKind = "brands" | "products" | "avatars";
export async function identityListData(kind: IdentityKind) {
  const { supabase, workspaceId } = await getWorkspaceContext();
  const { data, error } = await supabase
    .from(kind)
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data || [];
}
export async function identityDetailData(kind: IdentityKind, id: string) {
  const { supabase, workspaceId } = await getWorkspaceContext();
  const { data, error } = await supabase
    .from(kind)
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("id", id)
    .single();
  if (error || !data) notFound();
  return data;
}
export async function brandOptions() {
  const { supabase, workspaceId } = await getWorkspaceContext();
  const { data } = await supabase
    .from("brands")
    .select("id,name")
    .eq("workspace_id", workspaceId)
    .order("name");
  return data || [];
}
