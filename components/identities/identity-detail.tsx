"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CircleUserRound,
  Globe2,
  LoaderCircle,
  Package,
  Palette,
  Sparkles,
  Trash2,
} from "lucide-react";
type Kind = "brands" | "products" | "avatars";
type RecordValue = Record<string, unknown>;
export function IdentityDetail({
  kind,
  item,
}: {
  kind: Kind;
  item: RecordValue;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [value, setValue] = useState(item);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const Icon =
    kind === "brands"
      ? Palette
      : kind === "products"
        ? Package
        : CircleUserRound;
  useEffect(() => {
    if (
      kind === "brands" &&
      params.get("analyze") === "1" &&
      value.website &&
      value.status === "analyzing"
    )
      analyze();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  async function analyze() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/brands/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId: value.id, website: value.website }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setValue((v) => ({
        ...v,
        name: data.dna.name,
        industry: data.dna.industry,
        description: data.dna.description,
        positioning: data.dna.positioning,
        target_audience: data.dna.targetAudience,
        tone: data.dna.tone,
        visual_style: data.dna.visualStyle,
        colors: data.dna.colors,
        typography: data.dna.typography,
        preferred_phrases: data.dna.preferredPhrases,
        banned_phrases: data.dna.bannedPhrases,
        status: "active",
      }));
      router.replace(`/identities/brands/${value.id}`);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not analyze this brand.",
      );
    } finally {
      setLoading(false);
    }
  }
  async function remove() {
    if (
      !confirm(
        `Delete this ${kind.slice(0, -1)}? Its generated project history will be retained.`,
      )
    )
      return;
    const response = await fetch(`/api/identities/${kind}/${value.id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      router.push(`/identities/${kind}`);
      router.refresh();
    } else setError("Could not delete this identity.");
  }
  const colors = Array.isArray(value.colors) ? (value.colors as string[]) : [];
  const tags = (key: string) =>
    Array.isArray(value[key]) ? (value[key] as string[]) : [];
  return (
    <div className="identity-detail-page">
      <div className="detail-toolbar">
        <button
          className="back-button"
          onClick={() => router.push(`/identities/${kind}`)}
        >
          <ArrowLeft size={15} />
          All {kind}
        </button>
        <div>
          <button className="danger" onClick={remove}>
            <Trash2 size={15} />
            Delete
          </button>
        </div>
      </div>
      <header className="identity-detail-hero">
        <div
          className="identity-monogram"
          style={{ background: colors[0] || "#1b1b19" }}
        >
          {String(value.name || "ID")
            .slice(0, 2)
            .toUpperCase()}
        </div>
        <div>
          <p className="eyebrow">
            <Icon size={13} />
            {String(
              value.industry || value.source_type || kind.slice(0, -1),
            ).replaceAll("_", " ")}
          </p>
          <h1>{String(value.name)}</h1>
          <p>
            {String(
              value.description ||
                "Add a description to make this identity more useful in every generation.",
            )}
          </p>
          {Boolean(value.website) && (
            <a href={String(value.website)} target="_blank" rel="noreferrer">
              <Globe2 size={14} />
              {String(value.website).replace(/^https?:\/\//, "")}
              <ArrowRight size={13} />
            </a>
          )}
        </div>
        <button
          className="button button-dark"
          onClick={() =>
            router.push(
              kind === "products"
                ? "/create/product-video"
                : kind === "avatars"
                  ? "/create/ugc"
                  : "/create/ad",
            )
          }
        >
          Create with this <Sparkles size={15} />
        </button>
      </header>
      {loading ? (
        <div className="analysis-state">
          <div className="generation-orb">
            <i />
            <i />
            <i />
          </div>
          <LoaderCircle className="spin" size={18} />
          <h2>Learning your brand language</h2>
          <p>
            Reading positioning, audience, tone and visual cues. You&apos;ll
            review everything before it becomes creative memory.
          </p>
        </div>
      ) : (
        <div className="dna-grid">
          <section>
            <span>Audience</span>
            <p>{String(value.target_audience || "Not set yet")}</p>
          </section>
          <section>
            <span>Positioning</span>
            <p>{String(value.positioning || value.usp || "Not set yet")}</p>
          </section>
          <section>
            <span>Personality / tone</span>
            <div className="tag-list">
              {(tags("tone").length ? tags("tone") : tags("tags")).map((x) => (
                <i key={x}>{x}</i>
              ))}
            </div>
            <p>{String(value.personality || "")}</p>
          </section>
          <section>
            <span>Visual language</span>
            <div className="tag-list">
              {tags("visual_style").map((x) => (
                <i key={x}>{x}</i>
              ))}
            </div>
            <p>{String(value.speaking_style || "")}</p>
          </section>
          {kind === "brands" && (
            <section className="color-section">
              <span>Brand colors</span>
              <div>
                {(colors.length
                  ? colors
                  : ["#171716", "#ef664f", "#f3f0e9"]
                ).map((color) => (
                  <i key={color} style={{ background: color }}>
                    <small>{color}</small>
                  </i>
                ))}
              </div>
            </section>
          )}{" "}
          {kind === "products" && (
            <section className="feature-section">
              <span>Features</span>
              <ul>
                {tags("features").map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </section>
          )}
          <section>
            <span>Reference assets</span>
            <div className="reference-empty">
              <Sparkles size={20} />
              <p>No assets yet</p>
              <Link href="/workspace/assets">Upload references</Link>
            </div>
          </section>
        </div>
      )}
      {error && <p className="form-error detail-error">{error}</p>}
      {kind === "brands" && Boolean(value.website) && !loading && (
        <button className="reanalyze-button" onClick={analyze}>
          <Sparkles size={15} />
          Re-analyze website
        </button>
      )}
    </div>
  );
}
