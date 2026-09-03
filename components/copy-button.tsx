"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function CopyButton({ value, label = "Copy link" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }
  return <button type="button" className="copy-action" onClick={copy} aria-label={label}>
    {copied ? <Check size={18} /> : <Copy size={18} />}{copied ? "Copied" : label}
  </button>;
}
