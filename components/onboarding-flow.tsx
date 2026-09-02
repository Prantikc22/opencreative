"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clapperboard,
  CircleUserRound,
  Globe2,
  ImageIcon,
  Layers3,
  LoaderCircle,
  Mic2,
  PackageOpen,
  Sparkles,
  Upload,
} from "lucide-react";
import { BrandMark } from "@/components/brand-mark";

const intents = [
  ["ugc", "UGC Ad", "Creator-led ads", CircleUserRound],
  ["product_ad", "Product Ad", "Polished campaigns", PackageOpen],
  ["marketing_video", "Marketing Video", "Multi-shot stories", Clapperboard],
  ["ai_video", "AI Video", "Any scene, from text", Sparkles],
  ["ai_images", "AI Images", "Photos, art and design", ImageIcon],
  ["avatar", "AI Avatar", "Reusable AI creators", CircleUserRound],
  ["voice", "AI Voice", "Speech and dubbing", Mic2],
  ["explore", "Explore Everything", "See the full studio", Layers3],
] as const;

export function OnboardingFlow({ firstName }: { firstName: string }) {
  const [step, setStep] = useState(1);
  const [intent, setIntent] = useState("");
  const [brandMode, setBrandMode] = useState<
    "website" | "upload" | "skip" | ""
  >("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  async function finish() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intent, brandMode, website }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      router.push(data.next || "/app");
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not finish setup.",
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <main className="onboarding-shell">
      <header>
        <BrandMark />
        <span>Step {step} of 2</span>
      </header>
      <div className="onboarding-progress">
        <i style={{ width: `${step * 50}%` }} />
      </div>
      <section className="onboarding-card">
        {step === 1 ? (
          <>
            <p className="eyebrow">Welcome, {firstName}</p>
            <h1>
              What do you want
              <br />
              to create first?
            </h1>
            <p className="onboarding-copy">
              We&apos;ll shape your studio around the work you want to make. You
              can explore everything later.
            </p>
            <div className="intent-grid">
              {intents.map(([value, title, copy, Icon]) => (
                <button
                  className={intent === value ? "selected" : ""}
                  onClick={() => setIntent(value)}
                  key={value}
                >
                  <span>
                    <Icon size={21} />
                  </span>
                  <strong>{title}</strong>
                  <small>{copy}</small>
                  {intent === value && (
                    <i>
                      <Check size={12} />
                    </i>
                  )}
                </button>
              ))}
            </div>
            <div className="onboarding-actions">
              <span />
              <button
                className="button button-dark"
                disabled={!intent}
                onClick={() => setStep(2)}
              >
                Continue <ArrowRight size={17} />
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="eyebrow">Creative memory</p>
            <h1>
              Do you already
              <br />
              have a brand?
            </h1>
            <p className="onboarding-copy">
              Give us a head start. We&apos;ll learn your visual language, voice
              and products—not just your logo.
            </p>
            <div className="brand-mode-list">
              <button
                className={brandMode === "website" ? "selected" : ""}
                onClick={() => setBrandMode("website")}
              >
                <span>
                  <Globe2 size={21} />
                </span>
                <div>
                  <strong>Paste your website</strong>
                  <small>We&apos;ll propose your Brand DNA for review.</small>
                </div>
                <ArrowRight size={17} />
              </button>
              {brandMode === "website" && (
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yourbrand.com"
                  autoFocus
                />
              )}
              <button
                className={brandMode === "upload" ? "selected" : ""}
                onClick={() => setBrandMode("upload")}
              >
                <span>
                  <Upload size={21} />
                </span>
                <div>
                  <strong>Upload brand assets</strong>
                  <small>Start with logos, colors and references.</small>
                </div>
                <ArrowRight size={17} />
              </button>
              <button
                className={brandMode === "skip" ? "selected" : ""}
                onClick={() => setBrandMode("skip")}
              >
                <span>
                  <Sparkles size={21} />
                </span>
                <div>
                  <strong>Skip for now</strong>
                  <small>Jump straight into your creative studio.</small>
                </div>
                <ArrowRight size={17} />
              </button>
            </div>
            {error && <p className="form-error">{error}</p>}
            <div className="onboarding-actions">
              <button className="back-button" onClick={() => setStep(1)}>
                <ArrowLeft size={16} /> Back
              </button>
              <button
                className="button button-dark"
                disabled={
                  !brandMode || loading || (brandMode === "website" && !website)
                }
                onClick={finish}
              >
                {loading ? (
                  <LoaderCircle className="spin" size={18} />
                ) : (
                  <>
                    Enter studio <ArrowRight size={17} />
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
