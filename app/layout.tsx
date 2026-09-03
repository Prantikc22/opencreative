import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./product.css";
import "./marketing-v2.css";
import "./site-footer.css";
import "./pricing-redesign.css";
import "./home-2026.css";
import "./workspace-polish.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ),
  title: {
    default: "OpenCreative. One AI studio. Anything you can imagine.",
    template: "%s | OpenCreative",
  },
  description:
    "Create cinematic videos, product ads, UGC, images, voices and avatars with the world's best AI models.",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "OpenCreative. One AI studio. Anything you can imagine.",
    description:
      "Create cinematic videos, product ads, UGC, images, voices and avatars with the world's best AI models.",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1734,
        height: 907,
        alt: "OpenCreative. One AI studio. Anything you can imagine.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenCreative. One AI studio. Anything you can imagine.",
    description:
      "Create cinematic videos, product ads, UGC, images, voices and avatars with the world's best AI models.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
