import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { productConfig } from "@/lib/config";
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
        <h2>Agreement</h2>
        <p>
          These terms form an agreement between you and {productConfig.legalName},
          the company operating OpenCreative. By creating an account or purchasing
          a plan, you agree to these terms, the Privacy Policy, Acceptable Use
          Policy and Refund Policy.
        </p>
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
        <h2>Plans, renewals and cancellation</h2>
        <p>
          Subscriptions renew at the billing interval shown at checkout until
          cancelled. Creative and Agent plans are separate product entitlements.
          Cancelling stops the next renewal and access continues through the paid
          period unless the checkout terms state otherwise.
        </p>
        <h2>Payment processing</h2>
        <p>
          Our order process is conducted by our online reseller Paddle.com.
          Paddle.com is the Merchant of Record for all our orders. Paddle provides
          all customer service inquiries and handles returns.
        </p>
        <h2>Service changes and liability</h2>
        <p>
          We may improve, replace or discontinue models and features while
          preserving paid entitlements where reasonably possible. To the maximum
          extent permitted by law, the service is provided without warranties and
          our aggregate liability is limited to the amount you paid in the twelve
          months before the claim.
        </p>
        <h2>Questions</h2>
        <p>
          Contact{" "}
          <a href={`mailto:${productConfig.supportEmail}`}>{productConfig.supportEmail}</a> about
          these terms.
        </p>
      </section>
    </main>
  );
}
