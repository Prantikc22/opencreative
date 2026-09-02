import "server-only";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/auth";

export async function getWorkspaceContext() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: membership, error } = await supabase
    .from("workspace_members")
    .select("workspace_id, role, workspaces(id,name,slug,plan,settings)")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  if (error || !membership)
    throw new Error(
      "Your workspace is still being prepared. Run the Supabase migration, then sign in again.",
    );
  const workspace = Array.isArray(membership.workspaces)
    ? membership.workspaces[0]
    : membership.workspaces;
  const [{ data: profile }, { data: wallet }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name,avatar_url,onboarding_completed")
      .eq("id", user.id)
      .single(),
    supabase
      .from("credit_wallets")
      .select("balance,lifetime_used")
      .eq("workspace_id", membership.workspace_id)
      .single(),
  ]);
  return {
    user,
    supabase,
    workspaceId: membership.workspace_id as string,
    workspace,
    profile,
    wallet,
    role: membership.role,
  };
}
