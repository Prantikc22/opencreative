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
      <div className="auth-visual">
        <div className="auth-orbit auth-orbit-one" />
        <div className="auth-orbit auth-orbit-two" />
        <div className="auth-value">
          <p>One workspace. Every format.</p>
          <h2>
            From first brief to <em>finished campaign.</em>
          </h2>
          <span>
            Create images, video, voice, music, avatars and support agents
            without rebuilding the context each time.
          </span>
          <div className="auth-capabilities" aria-label="OpenCreative capabilities">
            <strong>IMAGE</strong>
            <strong>VIDEO</strong>
            <strong>VOICE</strong>
            <strong>AGENTS</strong>
          </div>
          <div className="auth-proof">
            <b>50 free credits</b>
            <span>No card required</span>
            <span>Premium models included</span>
          </div>
        </div>
      </div>
      <section className="auth-panel">{children}</section>
    </main>
  );
}
