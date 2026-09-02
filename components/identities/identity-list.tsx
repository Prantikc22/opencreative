import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CircleUserRound,
  Package,
  Palette,
  Plus,
  Sparkles,
} from "lucide-react";
type Kind = "brands" | "products" | "avatars";
type Item = {
  id: string;
  name: string;
  industry?: string | null;
  description?: string | null;
  source_type?: string;
  colors?: unknown;
  updated_at?: string;
};
const config = {
  brands: {
    title: "Brands",
    headline: "Your brand, remembered.",
    copy: "A living source of truth for visual language, positioning, audience and tone.",
    Icon: Palette,
  },
  products: {
    title: "Products",
    headline: "Every product, understood.",
    copy: "Keep features, positioning and reference imagery ready for any creative workflow.",
    Icon: Package,
  },
  avatars: {
    title: "Avatars",
    headline: "Creators you can reuse.",
    copy: "Build fictional or authorized creator identities with consistent voice and personality.",
    Icon: CircleUserRound,
  },
} as const;
const stockAvatars = ["Mina", "Malik", "Elena", "Ravi", "Arjan", "Noa", "Kenji", "Amara"];
export function IdentityList({ kind, items }: { kind: Kind; items: Item[] }) {
  const c = config[kind];
  return (
    <div className="library-page">
      <header className="library-head">
        <div>
          <p className="eyebrow">
            <c.Icon size={13} />
            {c.title}
          </p>
          <h1>{c.headline}</h1>
          <p>{c.copy}</p>
        </div>
        <Link className="button button-dark" href={`/identities/${kind}/new`}>
          <Plus size={16} />
          Add {kind.slice(0, -1)}
        </Link>
      </header>
      {items.length ? (
        <div className="identity-grid">
          {items.map((item, index) => {
            const colors = Array.isArray(item.colors)
              ? (item.colors as string[])
              : [];
            return (
              <Link
                href={`/identities/${kind}/${item.id}`}
                key={item.id}
                className="identity-card"
              >
                <div className="identity-art">
                  {kind === "brands" ? (
                    <div className="brand-color-art">
                      {(colors.length
                        ? colors
                        : ["#171716", "#ef664f", "#e9e4d9"]
                      )
                        .slice(0, 3)
                        .map((color) => (
                          <i style={{ background: color }} key={color} />
                        ))}
                    </div>
                  ) : (
                    <c.Icon size={38} />
                  )}
                  <span>0{index + 1}</span>
                </div>
                <div>
                  <p>
                    {item.industry ||
                      item.source_type?.replaceAll("_", " ") ||
                      kind.slice(0, -1)}
                  </p>
                  <h2>{item.name}</h2>
                  <small>
                    {item.description?.slice(0, 90) ||
                      `Ready to use in ${kind === "avatars" ? "UGC and avatar videos" : "any generation"}.`}
                  </small>
                </div>
                <ArrowRight size={17} />
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="library-empty">
          <span>
            <Sparkles size={28} />
          </span>
          <h2>
            {kind === "brands"
              ? "Create your first Brand DNA"
              : kind === "products"
                ? "Add a product once. Create with it forever."
                : "Create a reusable AI creator"}
          </h2>
          <p>{c.copy}</p>
          <Link
            className="button button-coral"
            href={`/identities/${kind}/new`}
          >
            Get started <ArrowRight size={16} />
          </Link>
        </div>
      )}
      {kind === "avatars" && (
        <section className="stock-avatar-section">
          <div className="section-head">
            <div>
              <p className="eyebrow"><CircleUserRound size={14} /> OpenCreative cast</p>
              <h2>Start with a ready-to-perform presenter.</h2>
            </div>
            <p>
              Curated fictional presenters are pre-authorized for generation.
              Pick one and go directly to the avatar studio.
            </p>
          </div>
          <div className="stock-avatar-grid">
            {stockAvatars.map((name, index) => (
              <Link
                href={`/studio/avatar?presenter=${name.toLowerCase()}`}
                key={name}
              >
                <Image
                  src={`/avatars/avatar-${String(index + 1).padStart(2, "0")}.png`}
                  alt={`${name}, OpenCreative fictional presenter`}
                  fill
                  sizes="(max-width: 800px) 50vw, 18vw"
                />
                <span>Stock presenter</span>
                <strong>{name}</strong>
                <ArrowRight size={16} />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
