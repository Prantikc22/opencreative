import type { Metadata } from "next";
import { PaddlePaymentLink } from "@/components/paddle-payment-link";

export const metadata: Metadata = { title: "Secure payment", robots: { index: false, follow: false } };

export default function Page() { return <PaddlePaymentLink />; }
