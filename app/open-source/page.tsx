import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, AudioLines, Bot, Braces, Check, CircleUserRound, Clapperboard, Cloud, Code2, Database, GitBranch, HardDrive, ImageIcon, KeyRound, LockKeyhole, Music2, Route, ServerCog, ShieldCheck, Users } from "lucide-react";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SupportAgentWidget } from "@/components/marketing/support-agent-widget";
import { productConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Open source and self-hosting",
  description: "Inspect, extend, and self-host the OpenCreative core with your own Supabase, R2, and OpenRouter accounts.",
};

const architecture = [
  [Route, "Inspectable routing", "Model selection, capability rules, fallbacks, and credit estimates remain visible in application code."],
  [Database, "Your data model", "Workspaces, agents, assets, generations, and the immutable credit ledger live in your Supabase project."],
  [HardDrive, "Your media", "Uploads and generated files stay private in your R2 bucket and use short-lived signed delivery links."],
] as const;

const steps = [
  ["01", "Clone and configure", "Copy the environment template and choose the provider accounts that your deployment will use."],
  ["02", "Apply the data model", "Run the Supabase migrations to install workspace isolation, RLS policies, credits, agents, and generation history."],
  ["03", "Connect private media", "Create an R2 bucket and provide the credentials used for private uploads and signed asset delivery."],
  ["04", "Build and deploy", "Typecheck, test, and build the same Next.js application that runs the hosted product."],
] as const;

const safeguards = [
  [Users, "Tenant boundaries", "Every commercial record is scoped to a workspace, and database policies verify membership before access."],
  [LockKeyhole, "Server-only secrets", "OpenRouter, Supabase service-role, and storage credentials stay in the server runtime."],
  [ShieldCheck, "Metered generations", "Credits are reserved before provider work, settled after success, and returned when a job fails."],
] as const;

const capabilities = [
  [ImageIcon, "Image", "Route prompts through the model registry, keep generation history, and save finished work to private media storage."],
  [Clapperboard, "Video", "Submit asynchronous video jobs and poll provider status without asking the local machine to transcode media."],
  [AudioLines, "Voice and dubbing", "Generate multilingual speech or transcribe uploaded audio and supported video containers."],
  [Music2, "Music", "Generate provider-backed music when the selected OpenRouter model is available to your account."],
  [CircleUserRound, "Avatars", "Store consented identities and use approved source media in presenter workflows."],
  [Bot, "Agents", "Create workspace-scoped agents with separate knowledge, voice, sessions, messages, and usage."],
] as const;

const envGroups = [
  ["Application", "NEXT_PUBLIC_APP_URL", "NEXT_PUBLIC_APP_NAME"],
  ["Supabase", "NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "SUPABASE_SERVICE_ROLE_KEY"],
  ["OpenRouter", "OPENROUTER_API_KEY", "OPENROUTER_SITE_URL", "OPENROUTER_APP_NAME"],
  ["Cloudflare R2", "R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET_NAME"],
] as const;

export default function OpenSourcePage() {
  return (
    <main className="marketing-shell home-2026 open-source-page">
      <MarketingNav />
      <section className="oss-hero">
        <div>
          <p><Code2 size={15} /> OPEN-SOURCE CORE</p>
          <h1>Own your<br />creative stack.</h1>
          <span>Inspect the routing, keep control of your data, and deploy the core with infrastructure you own. Use the hosted studio when you want convenience, or self-host when control is the requirement.</span>
          <div>
            <a className="oc-button oc-button-coral" href={productConfig.githubUrl} target="_blank" rel="noreferrer">View the repository <ArrowRight size={16} /></a>
            <Link className="oc-button oc-button-outline-light" href="#self-hosting">Self-hosting guide</Link>
          </div>
        </div>
        <aside aria-label="OpenCreative deployment map">
          <span>YOUR DEPLOYMENT</span>
          <div><Braces size={22} /><strong>OpenCreative</strong><small>Next.js application</small></div>
          <i />
          <section>
            <div><Database size={18} /><strong>Supabase</strong><small>Data and identity</small></div>
            <div><Cloud size={18} /><strong>Cloudflare R2</strong><small>Private media</small></div>
            <div><Route size={18} /><strong>OpenRouter</strong><small>Model access</small></div>
          </section>
        </aside>
      </section>
      <section className="oss-architecture">
        <header><p>PORTABLE BY DESIGN</p><h2>The important layers stay visible.</h2></header>
        <div>{architecture.map(([Icon, title, copy]) => <article key={title}><Icon size={28} /><span>OPENCREATIVE CORE</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
      </section>
      <section className="oss-self-host" id="self-hosting">
        <header>
          <p><ServerCog size={15} /> SELF-HOSTING</p>
          <h2>From clone to a private creative cloud.</h2>
          <span>The deployment is a standard Next.js application with explicit provider boundaries. Nothing depends on a hidden media proxy.</span>
        </header>
        <div className="oss-steps">{steps.map(([number, title, copy]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
        <div className="oss-terminal">
          <header><span>PRODUCTION CHECK</span><small>zsh</small></header>
          <pre><code>npm install{"\n"}npm run typecheck{"\n"}npm test{"\n"}npm run build{"\n"}npm start</code></pre>
          <footer><Check size={15} /> No local video transcoding required</footer>
        </div>
      </section>
      <section className="oss-environment">
        <header><p><KeyRound size={15} /> REQUIRED SERVICES</p><h2>Four boundaries.<br />No mystery layer.</h2></header>
        <div>
          <article><span>01</span><strong>Application</strong><p>Node.js and a Next.js-compatible runtime for the web application and route handlers.</p></article>
          <article><span>02</span><strong>Database</strong><p>Supabase Auth and Postgres with the included migrations and row-level security policies.</p></article>
          <article><span>03</span><strong>Storage</strong><p>A private Cloudflare R2 bucket for source media, finished assets, and signed delivery.</p></article>
          <article><span>04</span><strong>Models</strong><p>An OpenRouter key for the models enabled in the capability registry.</p></article>
        </div>
      </section>
      <section className="oss-capabilities">
        <header><p>WHAT SHIPS</p><h2>A useful core,<br />not a landing-page shell.</h2><span>The repository includes the product surfaces, model routing, tenant data model, private media flow, generation metering, and tests needed to extend the studio with your own provider accounts.</span></header>
        <div>{capabilities.map(([Icon, title, copy]) => <article key={title}><Icon size={25} /><h3>{title}</h3><p>{copy}</p></article>)}</div>
      </section>
      <section className="oss-checklist">
        <div><p>CONFIGURATION CHECKLIST</p><h2>Bring four service boundaries.</h2><span>Copy <code>.env.example</code>, add these server and public variables, then apply the included Supabase migrations. Secret values never belong in client components or source control.</span></div>
        <aside>{envGroups.map(([label, ...names]) => <section key={label}><strong>{label}</strong>{names.map(name => <code key={name}>{name}</code>)}</section>)}</aside>
      </section>
      <section className="oss-cloud-choice">
        <header><p>HOSTED OR SELF-HOSTED</p><h2>Control when you need it.<br />Convenience when you do not.</h2></header>
        <div><article><span>SELF-HOSTED CORE</span><h3>Your infrastructure</h3><ul><li>Bring provider, database, and storage accounts</li><li>Run migrations and deployment yourself</li><li>Own upgrades, observability, and incident response</li><li>Inspect and adapt provider routing</li></ul><a href={productConfig.githubUrl} target="_blank" rel="noreferrer">Clone the core <ArrowRight size={15} /></a></article><article><span>OPENCREATIVE CLOUD</span><h3>Ready workspace</h3><ul><li>Start without provisioning infrastructure</li><li>Managed credit accounting and private media</li><li>Provider routing configured for the product</li><li>Product updates without manual deployment work</li></ul><Link className="oc-button oc-button-coral" href="/signup">Start free <ArrowRight size={15} /></Link></article></div>
      </section>
      <section className="oss-safeguards">
        <header><p>SECURITY MODEL</p><h2>Workspace isolation is part of the architecture.</h2></header>
        <div>{safeguards.map(([Icon, title, copy]) => <article key={title}><Icon size={27} /><h3>{title}</h3><p>{copy}</p></article>)}</div>
      </section>
      <section className="oss-contribute" id="contributing">
        <div><GitBranch size={30} /><p>CONTRIBUTING</p><h2>Extend the core.<br /><em>Preserve the boundaries.</em></h2></div>
        <aside><p>Provider-specific behavior belongs behind the routing and provider layers. Changes to authentication, credits, storage, or generation state should include tests.</p><a className="oc-button oc-button-coral" href={productConfig.githubUrl} target="_blank" rel="noreferrer">Open GitHub <ArrowRight size={16} /></a></aside>
      </section>
      <SiteFooter />
      <SupportAgentWidget />
    </main>
  );
}
