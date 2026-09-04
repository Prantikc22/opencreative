"use client";

import { initializePaddle, type Paddle } from "@paddle/paddle-js";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { useState } from "react";

let paddlePromise: Promise<Paddle | undefined> | null = null;
let checkoutEventListener: ((name: string, detail?: string) => void) | null = null;

function paddleClient() {
  const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
  if (!token) return Promise.resolve(undefined);
  paddlePromise ||= initializePaddle({
    token,
    environment: process.env.NEXT_PUBLIC_PADDLE_ENV === "production" ? "production" : "sandbox",
    eventCallback: (event) => {
      const payload = event as unknown as { name?: string; error?: { detail?: string }; detail?: string };
      checkoutEventListener?.(payload.name || "", payload.error?.detail || payload.detail);
    },
  });
  return paddlePromise;
}

export function PaddleCheckoutButton({
  priceId,
  label,
  workspaceId,
  userId,
  purchaseType,
  itemId,
}: {
  priceId: string;
  label: string;
  workspaceId: string;
  userId: string;
  purchaseType: "subscription" | "credit_topup";
  itemId: string;
}) {
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState("");

  async function open() {
    setOpening(true);
    setError("");
    try {
      if (!priceId) throw new Error("This checkout item is not configured yet.");
      const paddle = await paddleClient();
      if (!paddle) throw new Error("Secure checkout is unavailable right now.");
      checkoutEventListener = (name, detail) => {
        if (name === "checkout.loaded") setOpening(false);
        if (name.includes("error")) {
          const message = detail?.includes("transaction_default_checkout_url_not_set")
            ? "Paddle checkout needs a Default payment link in Checkout settings."
            : "Paddle could not open checkout. Please try again.";
          setError(message);
          setOpening(false);
        }
      };
      paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customData: { workspace_id: workspaceId, user_id: userId, purchase_type: purchaseType, item_id: itemId },
        settings: {
          displayMode: "overlay",
          theme: "light",
          variant: "one-page",
          successUrl: `${window.location.origin}/account/credits?checkout=success`,
        },
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Checkout could not open.");
      setOpening(false);
    }
  }

  return <div className="paddle-buy-wrap">
    <button type="button" className="paddle-buy-button" onClick={open} disabled={opening || !priceId}>
      {opening ? <LoaderCircle className="spin" size={16} /> : null}{label}<ArrowRight size={15} />
    </button>
    {error && <small role="alert">{error}</small>}
  </div>;
}
