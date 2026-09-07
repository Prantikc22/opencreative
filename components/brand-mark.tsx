import { productConfig } from "@/lib/config";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="brand-mark" aria-label={productConfig.name}>
      <svg className="brand-glyph" viewBox="0 0 64 64" aria-hidden="true">
        <defs>
          <linearGradient id="brand-coral" x1="8" y1="8" x2="52" y2="55" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ff7669" />
            <stop offset=".55" stopColor="#ff5a49" />
            <stop offset="1" stopColor="#d9362a" />
          </linearGradient>
          <linearGradient id="brand-shadow" x1="8" y1="17" x2="28" y2="47" gradientUnits="userSpaceOnUse">
            <stop stopColor="#a52f26" />
            <stop offset="1" stopColor="#40100d" />
          </linearGradient>
        </defs>
        <path d="M9 20.8 25 16v32L9 43.2a4 4 0 0 1-2.8-3.8V24.6A4 4 0 0 1 9 20.8Z" fill="url(#brand-shadow)" />
        <path d="M19 12.8 49.8 21a3 3 0 0 1 2.2 2.9v5.2L28 24v16l24-5.1v5.2a3 3 0 0 1-2.2 2.9L19 51.2a4 4 0 0 1-5-3.9V16.7a4 4 0 0 1 5-3.9Z" fill="url(#brand-coral)" />
        <path d="M38 27.8 52 31v2l-14 3.2a2 2 0 0 1-2.4-2v-4.4a2 2 0 0 1 2.4-2Z" fill="#ff5a49" />
      </svg>
      {!compact && (
        <span className="brand-wordmark" aria-hidden="true">
          <span>Open</span><span>Creative</span>
        </span>
      )}
    </span>
  );
}
