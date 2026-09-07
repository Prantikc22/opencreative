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
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://www.opencreativehq.com").replace(/\/$/, "");
  const endpoint = `${appUrl}/api/mcp`;
  const codexConfig = `[mcp_servers.opencreative]\nurl = "${endpoint}"\n# OAuth sign-in is requested by Codex`;
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
        <div><p className="eyebrow">Connection guide</p><h2>Connect in three minutes.</h2><p>OAuth is the recommended path: add the remote URL, choose “Sign in with OpenCreative” in your assistant, sign in once, and the assistant returns here with a short-lived token. The token inherits this workspace&apos;s credits and permissions.</p></div>
        <ol>
          <li><CheckCircle2 size={18} /><span><strong>1. Add the remote server URL</strong><code>{endpoint}</code></span></li>
          <li><CheckCircle2 size={18} /><span><strong>2. Sign in once</strong><small>Your assistant follows OAuth 2.1 + PKCE and returns automatically after OpenCreative login.</small></span></li>
          <li><CheckCircle2 size={18} /><span><strong>3. Approve creative calls</strong><small>Every call is checked against your workspace entitlement and credit balance.</small></span></li>
        </ol>
        <div className="mcp-config-example">
          <strong>Choose your assistant</strong>
          <div className="mcp-client-grid">
            <article><h3>Codex</h3><p>Add the URL to your MCP settings, then let Codex open the browser sign-in. No API key needs to be pasted.</p><pre><code>{codexConfig}</code></pre></article>
            <article><h3>Claude or Cursor</h3><p>Open MCP settings, add a remote HTTP server with this URL, and select OAuth when offered.</p><pre><code>{JSON.stringify({ mcpServers: { opencreative: { url: endpoint } } }, null, 2)}</code></pre></article>
            <article><h3>ChatGPT / OpenAI API</h3><p>ChatGPT custom connectors use the same endpoint and protected-resource metadata. For the Responses API, use OAuth in the host or pass an API key for a non-interactive server integration.</p><pre><code>{`server_url: "${endpoint}"\n# OAuth discovery: ${endpoint}/.well-known/oauth-protected-resource`}</code></pre></article>
            <article><h3>Any MCP client</h3><p>Transport: Streamable HTTP. Start with OAuth discovery; the fallback header is <code>Authorization: Bearer oc_live_…</code> for a key created above.</p></article>
          </div>
          <p>Replace the placeholder with the key shown after you create it. Keep the key private: generations consume this workspace&apos;s credits.</p>
        </div>
      </section>
    </div>
  );
}
