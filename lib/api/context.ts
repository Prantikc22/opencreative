import "server-only";
import { requireApiUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { hasProductEntitlement, type ProductFamily } from "@/lib/entitlements";

export async function apiContext(requiredProduct?: ProductFamily) {
  const user = await requireApiUser();
  const supabase = await createClient();
  const { data: member, error } = await supabase
    .from("workspace_members")
    .select("workspace_id,role,workspaces(plan,settings,product_entitlements)")
    .eq("user_id", user.id)
    .limit(1)
    .single();
  if (error || !member) throw new Error("Workspace not found");
  const workspace = Array.isArray(member.workspaces)
    ? member.workspaces[0]
    : member.workspaces;
  if (requiredProduct && !hasProductEntitlement(workspace, requiredProduct))
    throw new Error(
      `${requiredProduct === "agents" ? "Agent" : "Creative"} product access required`,
    );
  return {
    user,
    supabase,
    workspaceId: member.workspace_id as string,
    role: member.role as string,
    workspace,
  };
}

export function apiError(cause: unknown) {
  console.error("OpenCreative API error", cause);
  const message = cause instanceof Error ? cause.message : "Unexpected error";
  const lower = message.toLowerCase();
  const status =
    message === "UNAUTHENTICATED"
      ? 401
      : lower.includes("product access required")
        ? 403
        : lower.includes("access denied") || lower.includes("storage")
        ? 503
        : message.includes("not found")
          ? 404
          : lower.includes("rate") ||
              lower.includes("quota") ||
              lower.includes("openrouter music 429") ||
              lower.includes("concurrent")
            ? 429
            : message.toLowerCase().includes("insufficient")
              ? 402
              : 500;
  return {
    message:
      status === 503
        ? "Media storage is temporarily unavailable. Your credits were returned. Please try again shortly."
        : status === 429
          ? "Provider capacity is temporarily unavailable. Your credits were returned. Please try again shortly."
        : status === 500
          ? "We couldn’t complete that creative request. Your credits were returned. Please try again."
          : message,
    status,
  };
}
