import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { JsonLd } from "@/components/json-ld";
import { PrivacyConsent } from "@/components/privacy-consent";
import { absoluteUrl } from "@/lib/seo";
import "./globals.css";
import "./product.css";
import "./marketing-v2.css";
import "./site-footer.css";
import "./pricing-redesign.css";
import "./home-2026.css";
import "./workspace-polish.css";
import "./seo-content.css";

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
    "Open-source AI creative studio for video, images, ads, UGC, speech, dubbing, avatars, agents, and complete marketing campaigns.",
  applicationName: "OpenCreative",
  authors: [{ name: "OpenCreative", url: absoluteUrl("/") }],
  creator: "OpenCreative",
  publisher: "ResoluteX HQ",
  category: "AI creative software",
  keywords: [
    "AI creative studio",
    "open source AI creative platform",
    "AI video generator",
    "AI voice generator",
    "AI avatar generator",
    "AI marketing studio",
    "video translation",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/icon.svg",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "OpenCreative. One AI studio. Anything you can imagine.",
    description:
      "Open-source AI creative studio for video, images, ads, UGC, speech, dubbing, avatars, agents, and complete marketing campaigns.",
    type: "website",
    url: "/",
    siteName: "OpenCreative",
    locale: "en_US",
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
      "Open-source AI creative studio for video, images, ads, UGC, speech, dubbing, avatars, agents, and complete marketing campaigns.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${absoluteUrl("/")}#organization`,
      name: "OpenCreative",
      legalName: "ResoluteX HQ",
      url: absoluteUrl("/"),
      logo: absoluteUrl("/opencreative-mark.svg"),
      sameAs: ["https://github.com/Prantikc22/opencreative"],
      contactPoint: { "@type": "ContactPoint", email: "engineering@resolutexhq.com", contactType: "customer support" },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${absoluteUrl("/")}#website`,
      name: "OpenCreative",
      url: absoluteUrl("/"),
      publisher: { "@id": `${absoluteUrl("/")}#organization` },
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "OpenCreative",
      applicationCategory: "MultimediaApplication",
      operatingSystem: "Web",
      url: absoluteUrl("/"),
      description: "Open-source AI creative studio for images, video, voice, avatars, localization, assets, and customer agents.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      isAccessibleForFree: true,
      license: "https://opensource.org/license/mit",
    },
  ];
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <JsonLd data={structuredData} />
        {children}
        <PrivacyConsent />
      </body>
    </html>
  );
}
