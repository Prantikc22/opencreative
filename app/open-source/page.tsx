import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Code2,
  Database,
  HardDrive,
  Route,
} from "lucide-react";

export const metadata: Metadata = { title: "Open source" };

export default function OpenSourcePage() {
  return (
    <main className="legal-page">
      <nav>
        <Link href="/">
          <ArrowLeft size={15} />
          OpenCreative
        </Link>
        <Link className="button button-dark" href="/signup">
          Start creating <ArrowRight size={15} />
        </Link>
      </nav>
      <header>
        <p className="eyebrow">
          <Code2 size={14} />
          Open-source core
        </p>
        <h1>Own your creative stack.</h1>
        <p>
          OpenCreative is designed around portable infrastructure: Next.js for
          the product, Supabase for data and identity, Cloudflare R2 for private
          media, and OpenRouter for model access.
        </p>
      </header>
      <section className="legal-grid">
        <article>
          <Route />
          <h2>Inspectable routing</h2>
          <p>
            Model selection, capability constraints and credit estimates live in
            application code instead of an opaque proxy.
          </p>
        </article>
        <article>
          <Database />
          <h2>Your data model</h2>
          <p>
            Projects, identities, assets, generations and the immutable credit
            ledger are stored in your Supabase project.
          </p>
        </article>
        <article>
          <HardDrive />
          <h2>Your media</h2>
          <p>
            Uploads and generated files stay in a private R2 bucket and are
            delivered with short-lived signed links.
          </p>
        </article>
      </section>
      <section className="legal-copy" id="self-hosting">
        <h2>Self-hosting</h2>
        <p>
          Use the included <code>.env.example</code>, apply the Supabase
          migration, create a private R2 bucket, and provide an OpenRouter key.
          The repository also includes architecture, deployment and contribution
          documentation.
        </p>
        <pre>
          npm install{"\n"}npm run typecheck{"\n"}npm run build{"\n"}npm start
        </pre>
        <h2 id="contributing">Contributing</h2>
        <p>
          Keep provider-specific behavior behind the routing and provider
          layers, preserve workspace isolation, and add tests for changes to
          authentication, credits, storage or generation state.
        </p>
      </section>
    </main>
  );
}
