"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Globe2,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";
type Kind = "brands" | "products" | "avatars";
type Brand = { id: string; name: string };
export function IdentityForm({
  kind,
  brands = [],
}: {
  kind: Kind;
  brands?: Brand[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [values, setValues] = useState<Record<string, string>>({
    name: "",
    website: "",
    industry: "",
    description: "",
    positioning: "",
    targetAudience: "",
    brandId: "",
    usp: "",
    price: "",
    usage: "",
    sourceType: "generated",
    personality: "",
    speakingStyle: "",
    preferredLanguage: "English",
    features: "",
    tone: "",
    visualStyle: "",
    tags: "",
  });
  const [consent, setConsent] = useState(false);
  function field(key: string, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload =
        kind === "brands"
          ? {
              name: values.name,
              website: values.website,
              industry: values.industry,
              description: values.description,
              positioning: values.positioning,
              targetAudience: values.targetAudience,
              tone: values.tone
                .split(",")
                .map((x) => x.trim())
                .filter(Boolean),
              visualStyle: values.visualStyle
                .split(",")
                .map((x) => x.trim())
                .filter(Boolean),
              colors: [],
            }
          : kind === "products"
            ? {
                name: values.name,
                brandId: values.brandId,
                description: values.description,
                features: values.features
                  .split("\n")
                  .map((x) => x.trim())
                  .filter(Boolean),
                usp: values.usp,
                price: values.price,
                targetAudience: values.targetAudience,
                usage: values.usage,
              }
            : {
                name: values.name,
                sourceType: values.sourceType,
                personality: values.personality,
                speakingStyle: values.speakingStyle,
                preferredLanguage: values.preferredLanguage,
                tags: values.tags
                  .split(",")
                  .map((x) => x.trim())
                  .filter(Boolean),
                consent,
              };
      const response = await fetch(`/api/identities/${kind}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      router.push(
        `/identities/${kind}/${data.id}${kind === "brands" && values.website ? "?analyze=1" : ""}`,
      );
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not save this identity.",
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="identity-form-page">
      <button className="back-button" onClick={() => router.back()}>
        <ArrowLeft size={15} />
        Back
      </button>
      <header>
        <p className="eyebrow">
          <Sparkles size={13} />
          New {kind.slice(0, -1)}
        </p>
        <h1>
          {kind === "brands"
            ? "Build your Brand DNA."
            : kind === "products"
              ? "Teach us your product."
              : "Create a consistent avatar."}
        </h1>
        <p>
          {kind === "brands"
            ? "Paste a website for an AI-proposed identity, or enter the essentials manually."
            : kind === "products"
              ? "The richer the product memory, the less you repeat in every prompt."
              : "Generated avatars are fictional. Uploaded identities require explicit permission."}
        </p>
      </header>
      <form onSubmit={submit} className="identity-form">
        <section>
          <h2>Essentials</h2>
          <label className="form-field">
            Name
            <input
              value={values.name}
              onChange={(e) => field("name", e.target.value)}
              required
              placeholder={
                kind === "brands"
                  ? "Acme Coffee"
                  : kind === "products"
                    ? "Midnight Roast"
                    : "Maya"
              }
            />
          </label>
          {kind === "brands" && (
            <>
              <label className="form-field">
                Website <span>optional</span>
                <div className="input-icon">
                  <Globe2 size={16} />
                  <input
                    type="url"
                    value={values.website}
                    onChange={(e) => field("website", e.target.value)}
                    placeholder="https://yourbrand.com"
                  />
                </div>
              </label>
              <label className="form-field">
                Industry
                <input
                  value={values.industry}
                  onChange={(e) => field("industry", e.target.value)}
                  placeholder="Coffee & beverages"
                />
              </label>
            </>
          )}
          {kind === "products" && (
            <>
              <label className="form-field">
                Brand
                <select
                  value={values.brandId}
                  onChange={(e) => field("brandId", e.target.value)}
                >
                  <option value="">No brand relationship</option>
                  {brands.map((b) => (
                    <option value={b.id} key={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-field">
                Price <span>optional</span>
                <input
                  value={values.price}
                  onChange={(e) => field("price", e.target.value)}
                  placeholder="$24"
                />
              </label>
            </>
          )}
          {kind === "avatars" && (
            <label className="form-field">
              Identity source
              <select
                value={values.sourceType}
                onChange={(e) => field("sourceType", e.target.value)}
              >
                <option value="generated">Generated fictional avatar</option>
                <option value="authorized_upload">
                  Authorized identity upload
                </option>
                <option value="stock">Licensed stock avatar</option>
              </select>
            </label>
          )}
        </section>
        <section>
          <h2>Creative memory</h2>
          <label className="form-field">
            Description
            <textarea
              value={values.description}
              onChange={(e) => field("description", e.target.value)}
              placeholder={
                kind === "brands"
                  ? "What the brand stands for and how it should feel…"
                  : kind === "products"
                    ? "What it is, who it is for and why it matters…"
                    : "Appearance and identity notes…"
              }
            />
          </label>
          {kind === "brands" && (
            <>
              <label className="form-field">
                Positioning
                <textarea
                  value={values.positioning}
                  onChange={(e) => field("positioning", e.target.value)}
                  placeholder="Premium, approachable daily ritual…"
                />
              </label>
              <label className="form-field">
                Target audience
                <textarea
                  value={values.targetAudience}
                  onChange={(e) => field("targetAudience", e.target.value)}
                  placeholder="Urban professionals, 22–40…"
                />
              </label>
              <label className="form-field">
                Tone <span>comma separated</span>
                <input
                  value={values.tone}
                  onChange={(e) => field("tone", e.target.value)}
                  placeholder="Confident, warm, conversational"
                />
              </label>
              <label className="form-field">
                Visual style <span>comma separated</span>
                <input
                  value={values.visualStyle}
                  onChange={(e) => field("visualStyle", e.target.value)}
                  placeholder="Cinematic, earthy, minimal"
                />
              </label>
            </>
          )}
          {kind === "products" && (
            <>
              <label className="form-field">
                Features <span>one per line</span>
                <textarea
                  value={values.features}
                  onChange={(e) => field("features", e.target.value)}
                  placeholder={
                    "Single-origin beans\nDark chocolate finish\nCompostable packaging"
                  }
                />
              </label>
              <label className="form-field">
                Unique selling point
                <input
                  value={values.usp}
                  onChange={(e) => field("usp", e.target.value)}
                  placeholder="The one reason people choose it"
                />
              </label>
              <label className="form-field">
                Target audience
                <textarea
                  value={values.targetAudience}
                  onChange={(e) => field("targetAudience", e.target.value)}
                />
              </label>
              <label className="form-field">
                Usage / context
                <textarea
                  value={values.usage}
                  onChange={(e) => field("usage", e.target.value)}
                />
              </label>
            </>
          )}
          {kind === "avatars" && (
            <>
              <label className="form-field">
                Personality
                <textarea
                  value={values.personality}
                  onChange={(e) => field("personality", e.target.value)}
                  placeholder="Curious, sharp and approachable…"
                />
              </label>
              <label className="form-field">
                Speaking style
                <input
                  value={values.speakingStyle}
                  onChange={(e) => field("speakingStyle", e.target.value)}
                  placeholder="Natural pacing, conversational emphasis"
                />
              </label>
              <label className="form-field">
                Preferred language
                <input
                  value={values.preferredLanguage}
                  onChange={(e) => field("preferredLanguage", e.target.value)}
                />
              </label>
              <label className="form-field">
                Tags <span>comma separated</span>
                <input
                  value={values.tags}
                  onChange={(e) => field("tags", e.target.value)}
                  placeholder="ugc, skincare, calm"
                />
              </label>
            </>
          )}
        </section>
        <section className="asset-upload-section">
          <h2>Reference assets</h2>
          <label className="identity-upload">
            <Upload size={23} />
            <strong>Upload references after saving</strong>
            <small>
              PNG, JPG, WebP, MP4 or audio. Files go directly to private R2
              storage.
            </small>
          </label>
          {kind === "avatars" && values.sourceType === "authorized_upload" && (
            <label className="rights-confirm">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />
              <ShieldCheck size={20} />
              <span>
                <strong>Rights confirmation</strong>I confirm this is me, or I
                have explicit permission from this person to create and reuse
                their AI avatar.
              </span>
            </label>
          )}
        </section>
        {error && <p className="form-error">{error}</p>}
        <footer>
          <span>
            {kind === "brands" && values.website ? (
              <>
                <Sparkles size={14} /> Brand DNA will be proposed for review
              </>
            ) : (
              <>
                <Check size={14} /> You can edit this anytime
              </>
            )}
          </span>
          <button
            className="button button-dark"
            disabled={
              loading ||
              !values.name ||
              (kind === "avatars" &&
                values.sourceType === "authorized_upload" &&
                !consent)
            }
          >
            {loading ? (
              <LoaderCircle className="spin" size={17} />
            ) : (
              <>
                Save {kind.slice(0, -1)} <ArrowRight size={16} />
              </>
            )}
          </button>
        </footer>
      </form>
    </div>
  );
}
