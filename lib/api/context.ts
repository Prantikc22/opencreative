import "server-only";
import { requireApiUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";

export async function apiContext() {
  const user = await requireApiUser();
  const supabase = await createClient();
  const { data: member, error } = await supabase
    .from("workspace_members")
    .select("workspace_id,role")
    .eq("user_id", user.id)
    .limit(1)
    .single();
  if (error || !member) throw new Error("Workspace not found");
  return {
    user,
    supabase,
    workspaceId: member.workspace_id as string,
    role: member.role as string,
  };
}

export function apiError(cause: unknown) {
  console.error("OpenCreative API error", cause);
  const message = cause instanceof Error ? cause.message : "Unexpected error";
  const lower = message.toLowerCase();
  const status =
    message === "UNAUTHENTICATED"
      ? 401
      : lower.includes("access denied") || lower.includes("storage")
        ? 503
        : message.includes("not found")
          ? 404
          : message.toLowerCase().includes("rate") ||
              message.includes("concurrent")
            ? 429
            : message.toLowerCase().includes("insufficient")
              ? 402
              : 500;
  return {
    message:
      status === 503
        ? "Media storage is temporarily unavailable. Your credits were returned—please try again shortly."
        : status === 500
          ? "We couldn’t complete that creative request. Your credits were returned. Please try again."
          : message,
    status,
  };
}
