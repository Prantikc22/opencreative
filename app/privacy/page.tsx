import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { productConfig } from "@/lib/config";
export const metadata: Metadata = { title: "Privacy" };
export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <nav>
        <Link href="/">
          <ArrowLeft size={15} />
          OpenCreative
        </Link>
      </nav>
      <header>
        <p className="eyebrow">Privacy</p>
        <h1>Your work stays your work.</h1>
        <p>
          This page explains the data the hosted OpenCreative service needs to
          operate.
        </p>
      </header>
      <section className="legal-copy">
        <h2>What we process</h2>
        <p>
          Account and workspace details, creative instructions, uploaded
          references, generated outputs, operational logs and credit
          transactions.
        </p>
        <h2>Why we process it</h2>
        <p>
          To authenticate you, run the creative workflows you request, store
          your outputs, prevent abuse and maintain accurate usage records.
        </p>
        <h2>Storage and providers</h2>
        <p>
          Workspace data is stored in Supabase and private media in Cloudflare
          R2. Creative requests are sent to the configured model providers only
          when you initiate a workflow.
        </p>
        <h2>Retention and security</h2>
        <p>
          We retain account and transaction records for as long as needed to
          provide the service, meet legal obligations and resolve disputes.
          Private media uses access controls and time-limited delivery links.
        </p>
        <h2>Your control</h2>
        <p>
          You can delete projects, identities and media from the product. For an
          account-level request, contact{" "}
          <a href={`mailto:${productConfig.supportEmail}`}>{productConfig.supportEmail}</a>.
        </p>
        <h2>Payments</h2>
        <p>
          Paddle acts as merchant of record for paid orders. Paddle processes
          payment and billing information under its own privacy terms. We
          receive subscription, transaction and entitlement status needed to
          provide the product.
        </p>
      </section>
    </main>
  );
}
