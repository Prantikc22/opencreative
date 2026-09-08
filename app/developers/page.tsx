import Link from "next/link";
import { ArrowRight, AudioLines, Braces, CircleUserRound, Clapperboard, Coins, FileJson, ImageIcon, KeyRound, Music2, ShieldCheck } from "lucide-react";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SupportAgentWidget } from "@/components/marketing/support-agent-widget";
import { DeveloperApiConsole } from "@/components/developer-api-console";
import { creditBundles } from "@/lib/pricing";

export const metadata = {
  title: "Developer API",
  description: "Build with OpenCreative image, video, speech, music, transcription, and avatar APIs using one key and prepaid credit wallet.",
};

const endpoints = [
  [ImageIcon, "Images", "POST", "/api/v1/images", "Create, edit, expand, enhance, and transform images."],
  [Clapperboard, "Video", "POST", "/api/v1/videos", "Generate shots or transform source footage with specialist models."],
  [AudioLines, "Speech", "POST", "/api/v1/speech", "Synthesize expressive speech with controllable voice and speed."],
  [Music2, "Music", "POST", "/api/v1/music", "Generate original commercial music from a creative brief."],
  [CircleUserRound, "Avatars", "POST", "/api/v1/avatars", "Create consented talking-presenter video."],
  [Braces, "Transcription", "POST", "/api/v1/transcriptions", "Turn audio and video into structured transcripts."],
] as const;

export default function DevelopersPage() {
  return (
    <main className="developer-public">
      <MarketingNav />
      <section className="developer-hero">
        <div>
          <p className="section-kicker">OPENCREATIVE API · V1</p>
          <h1>One API.<br /><em>Every creative medium.</em></h1>
          <p>Build image, video, voice, music, avatar, and transcription workflows with one server-side key, one model router, and one workspace credit wallet.</p>
          <div className="developer-actions">
            <Link className="oc-button oc-button-coral" href="/login?next=/account/mcp">Get an API key <ArrowRight size={16} /></Link>
            <Link className="oc-button oc-button-outline-light" href="/docs/api">Read API docs <FileJson size={16} /></Link>
          </div>
        </div>
        <DeveloperApiConsole />
      </section>

      <section className="developer-principles" aria-label="API platform features">
        <article><KeyRound size={22} /><strong>One hashed key</strong><p>Keys are shown once and stored as SHA-256 hashes. Revoke them from your workspace at any time.</p></article>
        <article><Coins size={22} /><strong>Usage-based credits</strong><p>Every response uses the same transparent credit meter as the studio. Failed provider jobs return reserved credits.</p></article>
        <article><ShieldCheck size={22} /><strong>Workspace isolated</strong><p>Every request inherits its key owner’s tenant, entitlement, credit wallet, and row-level access rules.</p></article>
      </section>

      <section className="developer-endpoints" id="reference">
        <header><div><p className="section-kicker">ENDPOINTS</p><h2>Built to ship,<br /><em>not to demo.</em></h2></div><p>Use an idempotency UUID on create calls. Video and avatar calls return a generation ID immediately; poll the generation endpoint for status and signed output URLs.</p></header>
        <div>
          {endpoints.map(([Icon, name, method, path, copy]) => <article key={path}><Icon size={21} /><span>{method}</span><h3>{name}</h3><code>{path}</code><p>{copy}</p></article>)}
        </div>
        <div className="developer-utility-routes"><code>GET /api/v1/models?capability=video</code><code>GET /api/v1/credits</code><code>GET /api/v1/generations/:id</code></div>
      </section>

      <section className="developer-billing">
        <div><p className="section-kicker">PAY AS YOU GO</p><h2>Prepaid capacity.<br /><em>No surprise invoice.</em></h2><p>Start with the 50-credit free wallet, subscribe for recurring capacity, or add a one-time Paddle credit bundle. Top-ups do not expire and developer calls draw from the same balance as the workspace.</p><Link className="oc-button oc-button-dark" href="/login?next=/account/credits">Open billing <ArrowRight size={16} /></Link></div>
        <div className="developer-bundle-grid">
          {creditBundles.map((bundle) => <article className={bundle.featured ? "featured" : ""} key={bundle.credits}><span>{bundle.featured ? "MOST POPULAR" : "ONE-TIME"}</span><strong>{bundle.credits.toLocaleString()} credits</strong><b>${bundle.price}</b><p>{bundle.description}</p></article>)}
        </div>
      </section>

      <section className="developer-final">
        <p className="section-kicker">START BUILDING</p><h2>From first request<br /><em>to production output.</em></h2><div><Link className="oc-button oc-button-coral" href="/login?next=/account/mcp">Create a key <ArrowRight size={16} /></Link><Link className="oc-button oc-button-dark" href="/docs/api">Read the docs</Link><Link className="oc-button oc-button-dark" href="/mcp">Need MCP instead?</Link></div>
      </section>
      <SiteFooter />
      <SupportAgentWidget />
    </main>
  );
}
