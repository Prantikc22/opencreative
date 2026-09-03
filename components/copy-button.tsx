"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function CopyButton({ value, label = "Copy link" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);
  async function copy() {
    setError(false);
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = value;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const successful = document.execCommand("copy");
        textarea.remove();
        if (!successful) throw new Error("Copy was blocked");
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError(true);
    }
  }
  return <div className="copy-action-wrap"><button type="button" className="copy-action" onClick={copy} aria-label={label}>
    {copied ? <Check size={18} /> : <Copy size={18} />}{copied ? "Copied" : error ? "Select link" : label}
  </button>{error && <small role="alert">Browser blocked copying. Select the link and copy it manually.</small>}</div>;
}
