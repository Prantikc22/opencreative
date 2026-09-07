import Link from "next/link";
import { ArrowRight, Bot, Braces, ImageIcon, Music2, ShieldCheck, Sparkles, Video } from "lucide-react";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SupportAgentWidget } from "@/components/marketing/support-agent-widget";

export const metadata = {
  title: "MCP Server | OpenCreative",
  description: "Connect AI agents to OpenCreative image, video, voice, music, avatar, and campaign tools through MCP.",
};

const toolCards = [
  [ImageIcon, "Create images", "Generate campaign stills with up to five reference-image URLs."],
  [Video, "Create video", "Make a shot from a prompt, first frame, or reference set."],
  [Sparkles, "Create speech + avatars", "Synthesize multilingual speech or animate a consented user photo."],
  [Music2, "Create music", "Generate an original commercial soundtrack from the campaign brief."],
  [Braces, "Plan campaigns", "Turn one brief into concepts and an editable shot-by-shot plan."],
  [ShieldCheck, "Tenant-safe access", "Every call inherits the signed-in user's workspace, entitlements, credits, and row-level security."],
] as const;

const configExample = [
  "{",
  '  "mcpServers": {',
  '    "opencreative": {',
  '      "url": "https://www.opencreativehq.com/api/mcp"',
  "    }",
  "  }",
  "}",
].join("\n");

export default function McpPage() {
  return (
    <main className="mcp-public">
      <MarketingNav />
      <section className="mcp-hero">
        <p className="section-kicker">OPENCREATIVE MCP</p>
        <h1>Give your agents<br /><em>a creative studio.</em></h1>
        <p>Connect compatible AI assistants to the same image, video, voice, music, avatar, and campaign workflow your team uses in OpenCreative.</p>
        <div className="mcp-actions">
          <Link className="oc-button oc-button-coral" href="/login?next=/account/mcp">Connect with login <ArrowRight size={16} /></Link>
          <a className="oc-button oc-button-dark" href="#connect">See connection guide <ArrowRight size={16} /></a>
        </div>
      </section>

      <section className="mcp-tool-grid" aria-label="MCP tools">
        {toolCards.map(([Icon, title, copy]) => (
          <article key={title}>
            <Icon size={23} />
            <h2>{title}</h2>
            <p>{copy}</p>
          </article>
        ))}
      </section>

      <section className="mcp-connect" id="connect">
        <div>
          <p className="section-kicker">CONNECT</p>
          <h2>One authenticated endpoint.</h2>
          <p>OpenCreative supports OAuth 2.1 with PKCE. Compatible clients discover the protected-resource metadata, open a one-time OpenCreative login, and return to the calling assistant with a short-lived access token. The token is linked to your workspace, plan, creative entitlement, tenant permissions, and credit wallet—never to a raw Supabase credential.</p>
          <p>Reference inputs must be HTTPS URLs the model provider can fetch. Upload private files in OpenCreative first, then pass the resulting signed URL to the tool.</p>
          <p>OAuth endpoints: <code>/api/mcp/.well-known/oauth-protected-resource</code>, <code>/api/mcp/oauth/.well-known/oauth-authorization-server</code>, <code>/api/mcp/oauth/authorize</code>, and <code>/api/mcp/oauth/token</code>. API keys remain available for scripts and clients without OAuth.</p>
        </div>
        <div className="mcp-code-card">
          <span><Bot size={16} /> Remote MCP configuration</span>
          <pre><code>{configExample}</code></pre>
          <small>For Codex, ChatGPT, Claude, Cursor, and other OAuth-capable clients, add only the remote URL and choose “Sign in with OpenCreative” when prompted. For API-key clients, create and revoke a key under <code>Account → MCP &amp; API keys</code>; keys are stored as one-way hashes and shown only once.</small>
        </div>
      </section>

      <SiteFooter />
      <SupportAgentWidget />
    </main>
  );
}
