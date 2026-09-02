import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
export const metadata: Metadata = { title: "Terms" };
export default function TermsPage() {
  return (
    <main className="legal-page">
      <nav>
        <Link href="/">
          <ArrowLeft size={15} />
          OpenCreative
        </Link>
      </nav>
      <header>
        <p className="eyebrow">Terms</p>
        <h1>Create responsibly.</h1>
        <p>
          These are the core conditions for using the hosted OpenCreative
          service.
        </p>
      </header>
      <section className="legal-copy">
        <h2>Your rights and permissions</h2>
        <p>
          You must own or have permission to use prompts, brand assets,
          products, voices, faces and other references you submit. Do not use
          the service to impersonate, deceive, harass or violate another
          person&apos;s rights.
        </p>
        <h2>Generated media</h2>
        <p>
          Model output can be inaccurate or resemble existing material. You are
          responsible for reviewing creative work before publishing or using it
          commercially.
        </p>
        <h2>Availability and credits</h2>
        <p>
          Generation depends on third-party model providers and may occasionally
          fail. Reserved credits are returned when a provider job fails
          according to the application&apos;s credit ledger.
        </p>
        <h2>Questions</h2>
        <p>
          Contact{" "}
          <a href="mailto:hello@opencreative.ai">hello@opencreative.ai</a> about
          these terms.
        </p>
      </section>
    </main>
  );
}
