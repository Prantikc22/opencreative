import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { productConfig } from "@/lib/config";

export const metadata: Metadata = { title: "Customer support" };

export default function SupportPage() {
  return <main className="legal-page"><nav><Link href="/"><ArrowLeft size={15} />OpenCreative</Link></nav><header><p className="eyebrow">Customer support</p><h1>Help for product and billing.</h1><p>Send the account email, transaction details and a concise description so we can investigate quickly.</p></header><section className="legal-copy">
    <h2>Email</h2><p><a href={`mailto:${productConfig.supportEmail}`}>{productConfig.supportEmail}</a></p>
    <h2>Phone</h2><p>{productConfig.supportPhone ? <a href={`tel:${productConfig.supportPhone}`}>{productConfig.supportPhone}</a> : "A public support phone number must be configured before paid checkout is enabled."}</p>
    <h2>Billing and cancellation</h2><p>Use the Paddle buyer portal linked from the purchase receipt to review invoices, update payment details or cancel a subscription. You can also contact us and we will help locate the transaction.</p>
    <h2>Response targets</h2><p>Billing and account-access requests are prioritized. Standard product requests are handled during normal business hours in India.</p>
  </section></main>;
}
