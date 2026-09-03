"use server";

import { createHash, randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { getWorkspaceContext } from "@/lib/workspace";

export type McpKeyState = { token?: string; error?: string };

export async function createMcpKeyAction(
  _previous: McpKeyState,
  formData: FormData,
): Promise<McpKeyState> {
  const name = String(formData.get("name") || "MCP client").trim();
  if (name.length < 2 || name.length > 80) return { error: "Use a name between 2 and 80 characters." };
  const { user, supabase, workspaceId } = await getWorkspaceContext();
  const token = `oc_live_${randomBytes(24).toString("base64url")}`;
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const { error } = await supabase.from("workspace_api_keys").insert({
    workspace_id: workspaceId,
    user_id: user.id,
    name,
    token_hash: tokenHash,
    token_prefix: token.slice(0, 16),
    scopes: ["creative"],
  });
  if (error) return { error: error.message };
  revalidatePath("/account/mcp");
  return { token };
}

export async function revokeMcpKeyAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  const { user, supabase, workspaceId } = await getWorkspaceContext();
  if (id) {
    await supabase
      .from("workspace_api_keys")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id)
      .eq("workspace_id", workspaceId);
  }
  revalidatePath("/account/mcp");
}
