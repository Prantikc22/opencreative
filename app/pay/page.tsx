import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Secure payment", robots: { index: false, follow: false } };

export default function Page() { redirect("/account/credits"); }
