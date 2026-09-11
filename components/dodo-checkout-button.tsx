"use client";

import { ArrowRight, LoaderCircle } from "lucide-react";
import { useState } from "react";

export function DodoCheckoutButton({
  itemId,
  cadence,
  label,
}: {
  itemId: string;
  cadence: "monthly" | "annual" | "one-time";
  label: string;
}) {
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState("");

  async function open() {
    setOpening(true);
    setError("");
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ itemId, cadence }),
      });
      const payload = (await response.json()) as { checkoutUrl?: string; error?: string };
      if (!response.ok || !payload.checkoutUrl) throw new Error(payload.error || "Checkout could not open.");
      window.location.assign(payload.checkoutUrl);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Checkout could not open.");
      setOpening(false);
    }
  }

  return <div className="dodo-buy-wrap">
    <button type="button" className="dodo-buy-button" onClick={open} disabled={opening}>
      {opening ? <LoaderCircle className="spin" size={16} /> : null}{label}<ArrowRight size={15} />
    </button>
    {error && <small role="alert">{error}</small>}
  </div>;
}
