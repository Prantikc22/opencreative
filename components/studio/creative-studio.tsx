"use client";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  Check,
  Coins,
  Download,
  ImagePlus,
  LoaderCircle,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import {
  curatedModels,
  estimateCredits,
  routeModel,
} from "@/lib/models/registry";
import type { QualityTier } from "@/lib/types";

type Mode = "image" | "video" | "avatar";
type ResultAsset = { id: string; url: string; mime_type: string; kind: string };
const config = {
  image: {
    eyebrow: "Image studio",
    title: "Create the image in your head.",
    copy: "Generate, edit and art-direct on-brand imagery with reference-aware models.",
    placeholder:
      "A premium studio photograph of our coffee bag on travertine, morning light…",
  },
  video: {
    eyebrow: "Motion studio",
    title: "Turn an idea into motion.",
    copy: "Generate a single shot or start a multi-shot project. We route quality and cost automatically.",
    placeholder:
      "Slow cinematic push-in on an amber perfume bottle, warm reflections, soft haze…",
  },
  avatar: {
    eyebrow: "Avatar studio",
    title: "Give your message a face.",
    copy: "Create reusable, consent-safe presenter video with a reference identity and script.",
    placeholder:
      "Speak naturally to camera: Here’s the one thing I wish I knew before launching…",
  },
} as const;
const builtInAvatars = [
  { name: "Mina", src: "/avatars/avatar-01.png" },
  { name: "Malik", src: "/avatars/avatar-02.png" },
  { name: "Elena", src: "/avatars/avatar-03.png" },
  { name: "Ravi", src: "/avatars/avatar-04.png" },
  { name: "Arjan", src: "/avatars/avatar-05.png" },
  { name: "Noa", src: "/avatars/avatar-06.png" },
  { name: "Kenji", src: "/avatars/avatar-07.png" },
  { name: "Amara", src: "/avatars/avatar-08.png" },
];

export function CreativeStudio({ mode }: { mode: Mode }) {
  const c = config[mode];
  const [prompt, setPrompt] = useState("");
  const [quality, setQuality] = useState<QualityTier>(
    mode === "avatar" ? "premium" : "standard",
  );
  const [aspect, setAspect] = useState(mode === "image" ? "1:1" : "9:16");
  const [duration, setDuration] = useState(5);
  const [count, setCount] = useState(1);
  const [reference, setReference] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [consent, setConsent] = useState(false);
  const [advancedModel, setAdvancedModel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [generationId, setGenerationId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [assets, setAssets] = useState<ResultAsset[]>([]);
  const model = useMemo(
    () => routeModel(mode, quality, advancedModel),
    [mode, quality, advancedModel],
  );
  const credits = model
    ? estimateCredits(model, { duration, count, resolution: "720p" })
    : 0;
  useEffect(() => {
    const timeout = setTimeout(() => {
      try {
        const raw = sessionStorage.getItem("opencreative.command");
        if (raw) {
          const data = JSON.parse(raw);
          setPrompt(data.brief || data.prompt || "");
          setAspect(data.aspectRatio || aspect);
          setQuality(data.quality || quality);
          if (data.duration) setDuration(Math.min(10, data.duration));
          sessionStorage.removeItem("opencreative.command");
        } else {
          const query = new URLSearchParams(window.location.search);
          setPrompt(query.get("prompt") || "");
          setProjectId(query.get("projectId") || "");
          const requestedPresenter = query.get("presenter");
          const presenter = builtInAvatars.find(
            (item) => item.name.toLowerCase() === requestedPresenter,
          );
          if (mode === "avatar" && presenter) {
            setSelectedAvatar(presenter.name);
            setReference(`${window.location.origin}${presenter.src}`);
            setConsent(true);
          }
        }
      } catch {}
    }, 0);
    return () => clearTimeout(timeout);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!generationId || !loading || mode === "image") return;
    const timer = setInterval(async () => {
      const response = await fetch(`/api/generations/${generationId}`);
      const data = await response.json();
      if (!response.ok) {
        setError(data.error);
        setLoading(false);
        return;
      }
      setStatus(data.generation.status);
      if (
        ["completed", "failed", "cancelled"].includes(data.generation.status)
      ) {
        clearInterval(timer);
        setLoading(false);
        setAssets(data.assets || []);
        if (data.generation.status !== "completed")
          setError(
            data.generation.error_message ||
              "This generation could not be completed.",
          );
      }
    }, 15000);
    return () => clearInterval(timer);
  }, [generationId, loading, mode]);
  async function generate() {
    if (prompt.trim().length < 3) return;
    setLoading(true);
    setError("");
    setAssets([]);
    setStatus("queued");
    try {
      const endpoint =
        mode === "avatar" ? "/api/generate/avatar" : `/api/generate/${mode}`;
      const body =
        mode === "image"
          ? {
              prompt,
              quality,
              advancedModel: quality === "advanced" ? advancedModel : undefined,
              aspectRatio: aspect,
              count,
              projectId: projectId || undefined,
              idempotencyKey: crypto.randomUUID(),
            }
          : mode === "video"
            ? {
                prompt,
                quality,
                advancedModel:
                  quality === "advanced" ? advancedModel : undefined,
                aspectRatio: aspect,
                duration,
                resolution: "720p",
                generateAudio: true,
                projectId: projectId || undefined,
                idempotencyKey: crypto.randomUUID(),
              }
            : {
                script: prompt,
                referenceImage: reference,
                aspectRatio: aspect,
                duration: Math.max(5, duration),
                consent,
                projectId: projectId || undefined,
                idempotencyKey: crypto.randomUUID(),
              };
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setGenerationId(data.generationId);
      setStatus(data.status);
      if (mode === "image") {
        setAssets(data.assets || []);
        setLoading(false);
      }
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not start this generation.",
      );
      setLoading(false);
    }
  }
  const progressCopy: Record<string, string> = {
    queued: "Waiting for the best available model",
    planning: "Preparing your creative",
    generating:
      mode === "image" ? "Rendering your image" : "Generating your shot",
    processing: "Saving your finished media",
    completed: "Creative ready",
  };
  return (
    <div className="studio-page">
      <header className="studio-intro">
        <div>
          <p className="eyebrow">
            <Sparkles size={13} />
            {c.eyebrow}
          </p>
          <h1>{c.title}</h1>
          <p>{c.copy}</p>
        </div>
      </header>
      <div className="studio-layout">
        <section className="studio-controls">
          <div className="control-section">
            <label className="control-label">
              {mode === "avatar" ? "Script" : "Describe your creative"}
            </label>
            <textarea
              className="studio-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={c.placeholder}
            />
            <div className="prompt-foot">
              <span>{prompt.length} / 8,000</span>
            </div>
          </div>
          {mode === "avatar" && (
            <div className="control-section">
              <label className="control-label">Choose a presenter</label>
              <div className="studio-avatar-picker">
                {builtInAvatars.map((item) => (
                  <button
                    type="button"
                    key={item.name}
                    className={selectedAvatar === item.name ? "selected" : ""}
                    onClick={() => {
                      setSelectedAvatar(item.name);
                      setReference(`${window.location.origin}${item.src}`);
                      setConsent(true);
                    }}
                  >
                    <Image src={item.src} alt={item.name} fill sizes="90px" />
                    <span>{item.name}</span>
                    {selectedAvatar === item.name && <Check size={13} />}
                  </button>
                ))}
              </div>
              <label className="control-label custom-reference-label">
                Or use an authorized reference URL
              </label>
              <input
                className="studio-input"
                type="url"
                value={reference}
                onChange={(e) => {
                  setReference(e.target.value);
                  setSelectedAvatar("");
                }}
                placeholder="Paste a publicly accessible signed image URL"
              />
              <label className="consent-check">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                />
                <span>
                  I confirm I own or have explicit permission to use this
                  identity. Curated OpenCreative presenters are pre-authorized.
                </span>
              </label>
            </div>
          )}
          <div className="control-grid">
            <div className="control-section">
              <label className="control-label">Aspect ratio</label>
              <div className="segmented">
                {(mode === "image"
                  ? ["1:1", "4:3", "3:4", "16:9", "9:16"]
                  : ["16:9", "9:16", "1:1"]
                ).map((value) => (
                  <button
                    key={value}
                    className={aspect === value ? "active" : ""}
                    onClick={() => setAspect(value)}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
            {mode === "image" ? (
              <div className="control-section">
                <label className="control-label">Outputs</label>
                <div className="segmented">
                  {[1, 2, 4].map((value) => (
                    <button
                      key={value}
                      className={count === value ? "active" : ""}
                      onClick={() => setCount(value)}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="control-section">
                <label className="control-label">Duration</label>
                <div className="segmented">
                  {(mode === "avatar" ? [5, 10] : [4, 5, 6, 8, 10]).map(
                    (value) => (
                      <button
                        key={value}
                        className={duration === value ? "active" : ""}
                        onClick={() => setDuration(value)}
                      >
                        {value}s
                      </button>
                    ),
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="control-section">
            <label className="control-label">Quality</label>
            <div className="quality-grid">
              {(
                [
                  "fast",
                  "standard",
                  "premium",
                  ...(mode !== "avatar" ? ["advanced"] : []),
                ] as QualityTier[]
              ).map((value) => (
                <button
                  key={value}
                  className={quality === value ? "active" : ""}
                  onClick={() => setQuality(value)}
                >
                  <strong>{value[0].toUpperCase() + value.slice(1)}</strong>
                  <small>
                    {value === "fast"
                      ? "Lowest cost"
                      : value === "standard"
                        ? "Best balance"
                        : value === "premium"
                          ? "Highest quality"
                          : "Choose model"}
                  </small>
                  {quality === value && <Check size={13} />}
                </button>
              ))}
            </div>
            {quality === "advanced" && (
              <select
                className="studio-input"
                value={advancedModel}
                onChange={(e) => setAdvancedModel(e.target.value)}
              >
                <option value="">Select an available model</option>
                {curatedModels
                  .filter((m) => m.capability === mode)
                  .map((m) => (
                    <option value={m.id} key={m.id}>
                      {m.provider} · {m.displayName}
                    </option>
                  ))}
              </select>
            )}
          </div>
          <div className="cost-row">
            <span>
              <Coins size={16} /> Estimated cost
            </span>
            <strong>{credits} credits</strong>
          </div>
          {error && <p className="form-error">{error}</p>}
          <button
            className="generate-button"
            onClick={generate}
            disabled={
              loading ||
              prompt.trim().length < 3 ||
              (mode === "avatar" && (!reference || !consent))
            }
          >
            {loading ? (
              <LoaderCircle className="spin" size={18} />
            ) : (
              <Sparkles size={18} />
            )}{" "}
            {loading ? "Creating…" : `Generate ${mode}`}
            <ArrowRight size={17} />
          </button>
        </section>
        <section className="studio-canvas">
          {loading ? (
            <div className="generation-live">
              <div className="generation-orb">
                <i />
                <i />
                <i />
              </div>
              <p className="eyebrow">Live generation</p>
              <h2>{progressCopy[status] || "Preparing your creative"}</h2>
              <div className="actual-steps">
                {["queued", "generating", "processing", "completed"].map(
                  (step, index) => (
                    <span
                      key={step}
                      className={
                        step === status ||
                        (["generating", "processing", "completed"].indexOf(
                          status,
                        ) >=
                          ["generating", "processing", "completed"].indexOf(
                            step,
                          ) &&
                          index > 0)
                          ? "active"
                          : ""
                      }
                    >
                      <i />
                      {progressCopy[step]}
                    </span>
                  ),
                )}
              </div>
              <small>
                No fake percentage—this updates when the provider state changes.
              </small>
            </div>
          ) : assets.length ? (
            <div className={`result-grid result-${assets.length}`}>
              {assets.map((asset, index) => (
                <figure key={asset.id}>
                  {asset.kind === "video" ? (
                    <video src={asset.url} controls playsInline />
                  ) : (
                    <Image
                      src={asset.url}
                      alt={`Generated result ${index + 1}`}
                      fill
                      sizes="50vw"
                    />
                  )}
                  <figcaption>
                    <span>Version {index + 1}</span>
                    <div>
                      <a href={asset.url} download title="Download">
                        <Download size={16} />
                      </a>
                      <button title="Regenerate" onClick={generate}>
                        <RefreshCw size={15} />
                      </button>
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          ) : (
            <div className="canvas-empty">
              <span>
                <ImagePlus size={28} />
              </span>
              <h2>Your creative will appear here</h2>
              <p>
                Outputs stay connected to your project and generation history.
                Nothing is overwritten.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
