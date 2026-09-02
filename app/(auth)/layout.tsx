import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="auth-shell">
      <Link href="/" className="auth-logo">
        <BrandMark />
      </Link>
      <div className="auth-visual" aria-hidden="true">
        <div className="auth-orbit auth-orbit-one" />
        <div className="auth-orbit auth-orbit-two" />
        <p>Idea</p>
        <span>→</span>
        <strong>Finished creative</strong>
      </div>
      <section className="auth-panel">{children}</section>
    </main>
  );
}
