import { KeyRound, PlugZap, Trash2 } from "lucide-react";
import { getWorkspaceContext } from "@/lib/workspace";
import { McpKeyManager } from "@/components/mcp-key-manager";
import { revokeMcpKeyAction } from "./actions";

export const metadata = { title: "MCP & API keys" };

export default async function McpKeysPage() {
  const { user, supabase, workspaceId } = await getWorkspaceContext();
  const { data: keys } = await supabase
    .from("workspace_api_keys")
    .select("id,name,token_prefix,scopes,last_used_at,revoked_at,created_at")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  return (
    <div className="settings-page mcp-account-page">
      <header className="library-head"><div><p className="eyebrow"><PlugZap size={13} /> MCP & API keys</p><h1>Connect your creative agents.</h1><p>Secure keys for OpenCreative Cloud. Calls stay inside this workspace and use this workspace&apos;s creative credits.</p></div></header>
      <div className="mcp-account-grid">
        <McpKeyManager />
        <section className="mcp-key-list">
          <h2><KeyRound size={18} /> Your keys</h2>
          {!keys?.length && <p>No keys yet. Create one for a compatible MCP client.</p>}
          {keys?.map((key) => (
            <article key={key.id} className={key.revoked_at ? "revoked" : ""}>
              <div><strong>{key.name}</strong><code>{key.token_prefix}••••••••</code><small>{key.revoked_at ? "Revoked" : key.last_used_at ? `Last used ${new Date(key.last_used_at).toLocaleDateString()}` : "Never used"}</small></div>
              {!key.revoked_at && <form action={revokeMcpKeyAction}><input type="hidden" name="id" value={key.id} /><button type="submit" aria-label={`Revoke ${key.name}`}><Trash2 size={15} /> Revoke</button></form>}
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
