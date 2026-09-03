import { CheckCircle2, KeyRound, PlugZap, Trash2 } from "lucide-react";
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
  const endpoint = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/mcp`;
  const config = JSON.stringify({
    mcpServers: {
      opencreative: {
        url: endpoint,
        headers: { Authorization: "Bearer YOUR_OPENCREATIVE_MCP_KEY" },
      },
    },
  }, null, 2);
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
      <section className="mcp-connect-guide">
        <div><p className="eyebrow">Connection guide</p><h2>Connect in three minutes.</h2><p>Create a key above, then add OpenCreative as a remote HTTP MCP server in your compatible client. The key belongs to this signed-in cloud workspace—never use a Supabase access token.</p></div>
        <ol>
          <li><CheckCircle2 size={18} /><span><strong>1. Create and copy a key</strong><small>It is displayed once and can be revoked here at any time.</small></span></li>
          <li><CheckCircle2 size={18} /><span><strong>2. Add the server URL</strong><code>{endpoint}</code></span></li>
          <li><CheckCircle2 size={18} /><span><strong>3. Authenticate requests</strong><code>Authorization: Bearer oc_live_…</code><small>Calls inherit your tenant permissions and consume this workspace&apos;s credits.</small></span></li>
        </ol>
        <div className="mcp-config-example"><strong>Remote MCP configuration</strong><pre><code>{config}</code></pre><p>Replace the placeholder with the key shown after you create it. In Claude Desktop, Codex, Cursor, or another remote-MCP client, paste this into its MCP server configuration and restart or refresh the client.</p></div>
      </section>
    </div>
  );
}
