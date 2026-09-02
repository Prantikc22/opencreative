"use client";
import { useMemo, useState } from "react";
import Image from "next/image";
import {
  Download,
  FileAudio,
  Grid2X2,
  Heart,
  ImageIcon,
  List,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
type Asset = {
  id: string;
  file_name: string;
  kind: string;
  mime_type: string;
  url: string;
  created_at: string;
  is_favorite: boolean;
  source: string;
};
export function AssetLibrary({ assets }: { assets: Asset[] }) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [items, setItems] = useState(assets);
  const filtered = useMemo(
    () =>
      items.filter(
        (x) =>
          (kind === "all" || x.kind === kind) &&
          x.file_name.toLowerCase().includes(query.toLowerCase()),
      ),
    [items, query, kind],
  );
  async function remove(id: string) {
    if (
      !confirm(
        "Permanently delete this media file from storage? This cannot be undone.",
      )
    )
      return;
    const response = await fetch(`/api/assets/${id}`, { method: "DELETE" });
    if (response.ok) setItems(items.filter((x) => x.id !== id));
  }
  async function toggleFavorite(id: string) {
    const current = items.find((item) => item.id === id);
    if (!current) return;
    const response = await fetch(`/api/assets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFavorite: !current.is_favorite }),
    });
    if (response.ok) {
      setItems(
        items.map((item) =>
          item.id === id ? { ...item, is_favorite: !item.is_favorite } : item,
        ),
      );
    }
  }
  return (
    <div className="asset-library">
      <div className="library-tools">
        <label>
          <Search size={15} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search assets…"
          />
        </label>
        <div className="filter-pills">
          {["all", "image", "video", "audio", "export"].map((x) => (
            <button
              className={kind === x ? "active" : ""}
              onClick={() => setKind(x)}
              key={x}
            >
              {x}
            </button>
          ))}
        </div>
        <div className="view-toggle">
          <button
            className={view === "grid" ? "active" : ""}
            onClick={() => setView("grid")}
          >
            <Grid2X2 size={15} />
          </button>
          <button
            className={view === "list" ? "active" : ""}
            onClick={() => setView("list")}
          >
            <List size={16} />
          </button>
        </div>
      </div>
      {filtered.length ? (
        <div className={`asset-results ${view}`}>
          {filtered.map((asset) => (
            <article key={asset.id}>
              <div className="asset-preview">
                {asset.kind === "image" ? (
                  <Image
                    src={asset.url}
                    alt={asset.file_name}
                    fill
                    sizes="25vw"
                  />
                ) : asset.kind === "video" ? (
                  <video src={asset.url} preload="metadata" muted />
                ) : (
                  <span>
                    {asset.kind === "audio" ? (
                      <FileAudio size={30} />
                    ) : (
                      <ImageIcon size={30} />
                    )}
                  </span>
                )}
                <div className="asset-hover">
                  <a href={asset.url} download title="Download">
                    <Download size={16} />
                  </a>
                  <button
                    title={asset.is_favorite ? "Remove favorite" : "Favorite"}
                    className={asset.is_favorite ? "active" : ""}
                    onClick={() => toggleFavorite(asset.id)}
                  >
                    <Heart
                      size={16}
                      fill={asset.is_favorite ? "currentColor" : "none"}
                    />
                  </button>
                  <button title="Delete" onClick={() => remove(asset.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="asset-info">
                <span>
                  <strong>{asset.file_name}</strong>
                  <small>
                    {asset.kind} · {asset.source}
                  </small>
                </span>
                <time>
                  {new Date(asset.created_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </time>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="library-empty">
          <span>
            <Sparkles size={28} />
          </span>
          <h2>No assets match this view</h2>
          <p>Generate or upload media and it will stay organized here.</p>
        </div>
      )}
    </div>
  );
}
