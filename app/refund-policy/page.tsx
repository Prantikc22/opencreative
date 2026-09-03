import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { productConfig } from "@/lib/config";

export const metadata: Metadata = { title: "Refund policy" };

export default function RefundPolicyPage() {
  return <main className="legal-page"><nav><Link href="/"><ArrowLeft size={15} />OpenCreative</Link></nav><header><p className="eyebrow">Refund policy</p><h1>Clear before checkout.</h1><p>This policy explains renewals, cancellation and refund requests for hosted OpenCreative plans.</p></header><section className="legal-copy">
    <h2>Free access</h2><p>The Free Creative plan and Agent Sandbox do not require payment. Unused free credits or minutes have no cash value.</p>
    <h2>Paid subscriptions</h2><p>Paid plans renew automatically at the interval shown at checkout. You can cancel before renewal and retain access through the paid period.</p>
    <h2>Refund requests</h2><p>We offer a 30-day money-back guarantee on a customer&apos;s first subscription purchase when the service has not been materially consumed or abused. Renewal payments, usage overages, one-time credit bundles and consumed generation or agent usage are generally non-refundable except where required by law.</p>
    <h2>Failed service</h2><p>Failed provider jobs automatically return reserved creative credits. Agent usage is billed only for completed billable time under the metering rules shown at checkout.</p>
    <h2>How to request help</h2><p>Contact <a href={`mailto:${productConfig.supportEmail}`}>{productConfig.supportEmail}</a> with the account email and transaction details. Paddle, our merchant of record, may also handle the return through its buyer support service.</p>
  </section></main>;
}
