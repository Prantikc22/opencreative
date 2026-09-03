"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  CircleUserRound,
  Clapperboard,
  Coins,
  Lightbulb,
  LoaderCircle,
  Package,
  Palette,
  Play,
  RefreshCw,
  Sparkles,
  WandSparkles,
} from "lucide-react";

type Entity = { id: string; name: string };
type Mode = "ugc" | "marketing" | "product_video";
type Scene = {
  id: string;
  title: string;
  description: string;
  visualPrompt: string;
  voiceover: string;
  onScreenText: string;
  duration: number;
  shotType: string;
  generationId?: string;
  status?: string;
};
type Plan = {
  projectId: string;
  campaignTitle: string;
  audience: string;
  strategy: string;
  concepts: Array<{
    name: string;
    hook: string;
    idea: string;
    whyItWorks: string;
  }>;
  recommendedConcept: number;
  scenes: Scene[];
};
const configs = {
  ugc: {
    eyebrow: "UGC studio",
    title: "Create ads people trust.",
    copy: "Choose a product and creator. Your creative director builds hooks, a script and individual shots.",
    formats: [
      "Product review",
      "Unboxing",
      "Testimonial",
      "Problem → Solution",
      "Tutorial",
      "Storytime",
      "POV",
      "TikTok / Reel",
    ],
    tones: [
      "Authentic",
      "Energetic",
      "Luxury",
      "Casual",
      "Funny",
      "Professional",
    ],
  },
  marketing: {
    eyebrow: "AI marketing studio",
    title: "From product to campaign.",
    copy: "Start with a URL, product or idea. Get three concepts and a shot-by-shot creative plan.",
    formats: [
      "UGC",
      "Cinematic",
      "Product Showcase",
      "Social Reel",
      "Explainer",
      "Launch Ad",
      "Lifestyle",
      "Minimal",
      "Luxury",
      "High Energy",
    ],
    tones: [
      "Premium",
      "Direct response",
      "Editorial",
      "Playful",
      "Bold",
      "Minimal",
    ],
  },
  product_video: {
    eyebrow: "Product video",
    title: "Put your product in motion.",
    copy: "Turn reference-aware product memory into a cinematic, individually editable storyboard.",
    formats: [
      "Cinematic showcase",
      "Feature reveal",
      "Lifestyle",
      "Launch film",
      "Social reel",
      "Minimal studio",
    ],
    tones: ["Premium", "Energetic", "Warm", "Technical", "Luxury", "Playful"],
  },
} as const;
export function CampaignBuilder({
  mode,
  brands,
  products,
  avatars,
}: {
  mode: Mode;
  brands: Entity[];
  products: Entity[];
  avatars: Entity[];
}) {
  const c = configs[mode];
  const [step, setStep] = useState(1);
  const [brand, setBrand] = useState("");
  const [product, setProduct] = useState("");
  const [avatar, setAvatar] = useState("");
  const [format, setFormat] = useState<string>(c.formats[0]);
  const [tone, setTone] = useState<string>(c.tones[0]);
  const [brief, setBrief] = useState("");
  const [duration, setDuration] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [plan, setPlan] = useState<Plan | null>(null);
  const [concept, setConcept] = useState(0);
  useEffect(() => {
    const timeout = setTimeout(() => {
      try {
        const raw = sessionStorage.getItem("opencreative.command");
        if (raw) {
          const data = JSON.parse(raw);
          setBrief(data.brief || data.prompt || "");
          sessionStorage.removeItem("opencreative.command");
        }
      } catch {}
    }, 0);
    return () => clearTimeout(timeout);
  }, []);
  async function createPlan() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          brief,
          brandId: brand || undefined,
          productId: product || undefined,
          avatarId: avatar || undefined,
          format,
          tone,
          duration,
          aspectRatio: "9:16",
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setPlan(data);
      setConcept(data.recommendedConcept);
      setStep(4);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not create a campaign plan.",
      );
    } finally {
      setLoading(false);
    }
  }
  async function generateScene(scene: Scene, index: number) {
    if (!plan) return;
    setPlan({
      ...plan,
      scenes: plan.scenes.map((s, i) =>
        i === index ? { ...s, status: "submitting" } : s,
      ),
    });
    try {
      const response = await fetch("/api/generate/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: scene.visualPrompt,
          projectId: plan.projectId,
          sceneId: scene.id,
          aspectRatio: "9:16",
          duration: Math.max(4, Math.min(10, Math.round(scene.duration))),
          resolution: "720p",
          generateAudio: false,
          quality: "standard",
          idempotencyKey: crypto.randomUUID(),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setPlan((current) =>
        current
          ? {
              ...current,
              scenes: current.scenes.map((s, i) =>
                i === index
                  ? { ...s, status: "queued", generationId: data.generationId }
                  : s,
              ),
            }
          : current,
      );
      pollScene(data.generationId, index);
    } catch (cause) {
      setPlan((current) =>
        current
          ? {
              ...current,
              scenes: current.scenes.map((s, i) =>
                i === index ? { ...s, status: "failed" } : s,
              ),
            }
          : current,
      );
      setError(
        cause instanceof Error ? cause.message : "Could not generate scene.",
      );
    }
  }
  function pollScene(id: string, index: number) {
    const timer = setInterval(async () => {
      const response = await fetch(`/api/generations/${id}`);
      const data = await response.json();
      if (!response.ok) return;
      const status = data.generation.status;
      setPlan((current) =>
        current
          ? {
              ...current,
              scenes: current.scenes.map((s, i) =>
                i === index ? { ...s, status } : s,
              ),
            }
          : current,
      );
      if (["completed", "failed", "cancelled"].includes(status))
        clearInterval(timer);
    }, 15000);
  }
  if (plan && step === 4)
    return (
      <div className="campaign-plan-page">
        <header className="campaign-plan-head">
          <div>
            <button
              className="back-button"
              onClick={() => {
                setPlan(null);
                setStep(3);
              }}
            >
              <ArrowLeft size={15} /> Back to brief
            </button>
            <p className="eyebrow">
              <Sparkles size={13} />
              Creative direction ready
            </p>
            <h1>{plan.campaignTitle}</h1>
            <p>{plan.strategy}</p>
          </div>
          <div className="plan-meta">
            <span>
              <strong>{plan.scenes.length}</strong> scenes
            </span>
            <span>
              <strong>{duration}s</strong> target
            </span>
            <span>
              <strong>9:16</strong> vertical
            </span>
            <Link href={`/workspace/projects/${plan.projectId}`}>
              Open project <ArrowRight size={14} />
            </Link>
          </div>
        </header>
        <section className="concept-section">
          <div className="section-label">
            <Lightbulb size={16} />
            <span>Choose a creative concept</span>
          </div>
          <div className="concept-grid">
            {plan.concepts.map((item, index) => (
              <button
                className={concept === index ? "selected" : ""}
                onClick={() => setConcept(index)}
                key={item.name}
              >
                <span>0{index + 1}</span>
                {index === plan.recommendedConcept && <em>Recommended</em>}
                <h3>{item.name}</h3>
                <blockquote>“{item.hook}”</blockquote>
                <p>{item.idea}</p>
                <small>{item.whyItWorks}</small>
                {concept === index && (
                  <i>
                    <Check size={13} />
                  </i>
                )}
              </button>
            ))}
          </div>
        </section>
        <section className="storyboard-section">
          <div className="section-head">
            <div>
              <h2>Shot-by-shot storyboard</h2>
              <p>Generate, edit or replace every scene independently.</p>
            </div>
            <span className="cost-badge">
              <Coins size={14} /> Estimated 200 credits per 5s standard shot
            </span>
          </div>
          <div className="storyboard-list">
            {plan.scenes.map((scene, index) => (
              <article key={scene.id}>
                <div className="scene-frame">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <Clapperboard size={27} />
                  {scene.status && (
                    <em className={`scene-status status-${scene.status}`}>
                      {scene.status}
                    </em>
                  )}
                </div>
                <div className="scene-copy">
                  <span>
                    {scene.shotType} · {scene.duration}s
                  </span>
                  <h3>{scene.title}</h3>
                  <p>{scene.description}</p>
                  <details>
                    <summary>Generation prompt</summary>
                    <textarea
                      value={scene.visualPrompt}
                      onChange={(e) =>
                        setPlan({
                          ...plan,
                          scenes: plan.scenes.map((s, i) =>
                            i === index
                              ? { ...s, visualPrompt: e.target.value }
                              : s,
                          ),
                        })
                      }
                    />
                  </details>
                  <div className="scene-script">
                    <strong>Voiceover</strong>
                    <p>{scene.voiceover || "No voiceover — visual beat"}</p>
                    {scene.onScreenText && (
                      <small>On screen: {scene.onScreenText}</small>
                    )}
                  </div>
                </div>
                <div className="scene-actions">
                  <button
                    onClick={() => generateScene(scene, index)}
                    disabled={
                      !!scene.status &&
                      !["failed", "completed"].includes(scene.status)
                    }
                  >
                    {scene.status &&
                    !["failed", "completed"].includes(scene.status) ? (
                      <LoaderCircle className="spin" size={15} />
                    ) : scene.status === "completed" ? (
                      <RefreshCw size={15} />
                    ) : (
                      <Play size={15} />
                    )}{" "}
                    {scene.status === "completed"
                      ? "Regenerate"
                      : "Generate scene"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    );
  const canNext =
    step === 1
      ? !!product || (mode === "marketing" && !!brief)
      : step === 2
        ? !!format
        : brief.trim().length >= 10;
  return (
    <div className="campaign-builder">
      <header className="campaign-builder-head">
        <div>
          <p className="eyebrow">
            <Sparkles size={13} />
            {c.eyebrow}
          </p>
          <h1>{c.title}</h1>
          <p>{c.copy}</p>
        </div>
        <div className="builder-steps">
          {[1, 2, 3].map((value) => (
            <span key={value} className={step >= value ? "active" : ""}>
              <i>{step > value ? <Check size={11} /> : value}</i>
              {value === 1 ? "Identity" : value === 2 ? "Direction" : "Brief"}
            </span>
          ))}
        </div>
      </header>
      <section className="builder-panel">
        {step === 1 ? (
          <>
            <div className="panel-heading">
              <span>
                <Palette size={19} />
              </span>
              <div>
                <h2>Start with creative memory</h2>
                <p>
                  Select what this campaign should remember. You can create
                  without a brand, too.
                </p>
              </div>
            </div>
            <div className="entity-fields">
              <label className="form-field">
                Brand
                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                >
                  <option value="">No brand selected</option>
                  {brands.map((item) => (
                    <option value={item.id} key={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-field">
                Product
                <select
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                >
                  <option value="">
                    {mode === "marketing"
                      ? "Start from an idea"
                      : "Choose a product"}
                  </option>
                  {products.map((item) => (
                    <option value={item.id} key={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
              {mode === "ugc" && (
                <label className="form-field">
                  Creator
                  <select
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                  >
                    <option value="">Stock / generated creator</option>
                    {avatars.map((item) => (
                      <option value={item.id} key={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>
            {mode === "marketing" && !product && (
              <label className="form-field idea-field">
                Product URL or idea
                <textarea
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                  placeholder="Paste a product URL or describe what you want to launch…"
                />
              </label>
            )}
            <div className="new-identity-links">
              <Link href="/identities/brands/new">
                <Palette size={15} />
                Create brand
              </Link>
              <Link href="/identities/products/new">
                <Package size={15} />
                Add product
              </Link>
              {mode === "ugc" && (
                <Link href="/identities/avatars/new">
                  <CircleUserRound size={15} />
                  Create avatar
                </Link>
              )}
            </div>
          </>
        ) : step === 2 ? (
          <>
            <div className="panel-heading">
              <span>
                <WandSparkles size={19} />
              </span>
              <div>
                <h2>Choose the creative direction</h2>
                <p>This guides the hooks, pacing, shot types and voice.</p>
              </div>
            </div>
            <label className="choice-label">Format</label>
            <div className="format-grid">
              {c.formats.map((value) => (
                <button
                  className={format === value ? "selected" : ""}
                  onClick={() => setFormat(value)}
                  key={value}
                >
                  {value}
                  {format === value && <Check size={13} />}
                </button>
              ))}
            </div>
            <label className="choice-label">Tone</label>
            <div className="tone-row">
              {c.tones.map((value) => (
                <button
                  className={tone === value ? "selected" : ""}
                  onClick={() => setTone(value)}
                  key={value}
                >
                  {value}
                </button>
              ))}
            </div>
            <label className="choice-label">Length</label>
            <div className="tone-row">
              {[15, 20, 30, 45, 60].map((value) => (
                <button
                  className={duration === value ? "selected" : ""}
                  onClick={() => setDuration(value)}
                  key={value}
                >
                  {value}s
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="panel-heading">
              <span>
                <Lightbulb size={19} />
              </span>
              <div>
                <h2>What should this creative achieve?</h2>
                <p>
                  Write naturally. Your creative director will turn this into
                  three concepts and a storyboard.
                </p>
              </div>
            </div>
            <textarea
              className="campaign-brief"
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              placeholder="Example: Launch our new cold brew to urban professionals. Make it feel premium but accessible, with a strong first-three-seconds hook…"
            />
            <div className="brief-context">
              <span>
                <Palette size={14} />
                {brands.find((x) => x.id === brand)?.name || "No brand"}
              </span>
              <ChevronRight size={13} />
              <span>
                <Package size={14} />
                {products.find((x) => x.id === product)?.name || "Idea-led"}
              </span>
              <ChevronRight size={13} />
              <span>{format}</span>
              <span>{tone}</span>
              <span>{duration}s</span>
            </div>
            {error && <p className="form-error">{error}</p>}
          </>
        )}
        <footer>
          <button
            className="back-button"
            disabled={step === 1}
            onClick={() => setStep(Math.max(1, step - 1))}
          >
            <ArrowLeft size={16} />
            Back
          </button>
          {step < 3 ? (
            <button
              className="button button-dark"
              disabled={!canNext}
              onClick={() => setStep(step + 1)}
            >
              Continue <ArrowRight size={16} />
            </button>
          ) : (
            <button
              className="button button-coral"
              disabled={!canNext || loading}
              onClick={createPlan}
            >
              {loading ? (
                <LoaderCircle className="spin" size={17} />
              ) : (
                <Sparkles size={17} />
              )}{" "}
              {loading
                ? "Directing your campaign…"
                : "Create concepts & storyboard"}
            </button>
          )}
        </footer>
      </section>
    </div>
  );
}
