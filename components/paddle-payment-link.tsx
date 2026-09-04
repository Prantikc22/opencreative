"use client";

import { useEffect, useState } from "react";
import { initializePaddle } from "@paddle/paddle-js";
import Link from "next/link";
import { CreditCard, LoaderCircle } from "lucide-react";

const paddleToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;

export function PaddlePaymentLink() {
  const [error, setError] = useState(paddleToken ? "" : "Secure checkout is not configured.");
  useEffect(() => {
    if (!paddleToken) return;
    void initializePaddle({
      token: paddleToken,
      environment: process.env.NEXT_PUBLIC_PADDLE_ENV === "production" ? "production" : "sandbox",
      checkout: { settings: { displayMode: "overlay", theme: "light", variant: "one-page" } },
      eventCallback: (event) => {
        const payload = event as unknown as { name?: string; detail?: string };
        if (payload.name?.includes("error")) setError("Paddle could not load this payment link. Open billing or contact support.");
      },
    }).catch(() => setError("Paddle could not load this payment link."));
  }, []);
  return <main className="payment-link-page"><div><span><CreditCard size={23} /></span><p className="eyebrow">Secure checkout</p><h1>Opening your payment.</h1>{error ? <><p>{error}</p><Link href="/account/credits">Open billing</Link></> : <p><LoaderCircle className="spin" size={18} /> Paddle checkout will open automatically.</p>}</div></main>;
}
