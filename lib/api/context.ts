import "server-only";
import { createHash } from "node:crypto";
import { requireApiUser } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { hasProductEntitlement, type ProductFamily } from "@/lib/entitlements";
import { validateMcpAccessToken } from "@/lib/mcp/oauth";

async function resolveWorkspaceContext(supabase: ReturnType<typeof createAdminClient>, userId: string, workspaceId: string, requiredProduct: ProductFamily | undefined, scopes?: string[]) {
  if (requiredProduct && scopes && !scopes.includes(requiredProduct)) {
    throw new Error(`${requiredProduct === "agents" ? "Agent" : "Creative"} product access required`);
  }
  const [{ data: userResult }, { data: member }, { data: workspace }] = await Promise.all([
    supabase.auth.admin.getUserById(userId),
    supabase.from("workspace_members").select("role").eq("workspace_id", workspaceId).eq("user_id", userId).maybeSingle(),
    supabase.from("workspaces").select("id,plan,settings,product_entitlements").eq("id", workspaceId).maybeSingle(),
  ]);
  const user = userResult.user;
  if (!user || !member || !workspace) throw new Error("UNAUTHENTICATED");
  if (requiredProduct && !hasProductEntitlement(workspace, requiredProduct)) throw new Error(`${requiredProduct === "agents" ? "Agent" : "Creative"} product access required`);
  return { user, supabase, workspaceId, role: member.role as string, workspace };
}

export async function apiContext(requiredProduct?: ProductFamily, request?: Request) {
  const bearer = request?.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (bearer?.startsWith("oc_mcp_") && request) {
    const token = await validateMcpAccessToken(bearer, request);
    if (!token || !token.scope.split(/\s+/).includes("creative")) throw new Error("UNAUTHENTICATED");
    return resolveWorkspaceContext(createAdminClient(), token.user_id, token.workspace_id, requiredProduct, ["creative"]);
  }
  if (bearer?.startsWith("oc_live_")) {
    const supabase = createAdminClient();
    const tokenHash = createHash("sha256").update(bearer).digest("hex");
    const { data: apiKey } = await supabase
      .from("workspace_api_keys")
      .select("id,workspace_id,user_id,scopes")
      .eq("token_hash", tokenHash)
      .is("revoked_at", null)
      .maybeSingle();
    if (!apiKey) throw new Error("UNAUTHENTICATED");
    if (requiredProduct && !apiKey.scopes?.includes(requiredProduct))
      throw new Error(
        `${requiredProduct === "agents" ? "Agent" : "Creative"} product access required`,
      );
    await supabase
      .from("workspace_api_keys")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", apiKey.id);
    return resolveWorkspaceContext(supabase, apiKey.user_id, apiKey.workspace_id, requiredProduct, apiKey.scopes);
  }
  const publicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const tokenClient = bearer && publicUrl && publicKey
    ? createSupabaseClient(publicUrl, publicKey, {
        global: { headers: { Authorization: `Bearer ${bearer}` } },
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;
  const user = tokenClient
    ? (await tokenClient.auth.getUser(bearer)).data.user
    : await requireApiUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  const supabase = tokenClient || await createClient();
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
  const musicByok = message.includes("OPENROUTER_MUSIC_BYOK_QUOTA");
  return {
    message:
      musicByok
        ? "Music generation is blocked by the connected Google provider quota. Enable Google billing or shared-capacity fallback in OpenRouter, then try again. Your credits were returned."
        : status === 503
        ? "Media storage is temporarily unavailable. Your credits were returned. Please try again shortly."
        : status === 429
          ? "Provider capacity is temporarily unavailable. Your credits were returned. Please try again shortly."
        : status === 500
          ? "We couldn’t complete that creative request. Your credits were returned. Please try again."
          : message,
    status,
  };
}
