import { productConfig } from "@/lib/config";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="brand-mark">
      <span className="brand-glyph" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
      {!compact && <span>{productConfig.name}</span>}
    </span>
  );
}
