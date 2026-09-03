import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = { title: "Acceptable use" };

export default function AcceptableUsePage() {
  return <main className="legal-page"><nav><Link href="/"><ArrowLeft size={15} />OpenCreative</Link></nav><header><p className="eyebrow">Acceptable use</p><h1>Creative power needs consent.</h1><p>These rules protect people, brands and the wider public.</p></header><section className="legal-copy">
    <h2>Consent for identity features</h2><p>Do not clone a voice, create a realistic avatar, imitate a person or use someone&apos;s likeness without explicit permission and the legal right to do so.</p>
    <h2>Prohibited content</h2><p>Do not create deceptive impersonation, non-consensual intimate media, fraud, harassment, hate, illegal goods, malware, election deception, sexual content involving minors, or material that violates privacy or intellectual property rights.</p>
    <h2>High-impact decisions</h2><p>Do not use OpenCreative Agents to make final decisions about employment, housing, credit, insurance, healthcare or legal rights without qualified human review.</p>
    <h2>Enforcement</h2><p>We may block generation, suspend accounts, preserve required records and cooperate with lawful requests when we reasonably believe these rules were violated.</p>
  </section></main>;
}
