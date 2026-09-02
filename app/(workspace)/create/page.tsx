import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CircleUserRound,
  Clapperboard,
  ImageIcon,
  Layers3,
  Mic2,
  Package,
  Sparkles,
  WandSparkles,
} from "lucide-react";
export const metadata: Metadata = { title: "Create" };
const choices = [
  [
    "AI Ad",
    "From idea, URL or product to a finished campaign",
    "/create/ad",
    WandSparkles,
  ],
  [
    "UGC Ad",
    "Creator-led stories, hooks and shot plans",
    "/create/ugc",
    CircleUserRound,
  ],
  [
    "Product Video",
    "Cinematic multi-shot product creative",
    "/create/product-video",
    Package,
  ],
  [
    "AI Video",
    "Text, image or reference to motion",
    "/studio/video",
    Clapperboard,
  ],
  [
    "AI Image",
    "Product photos, posters, edits and more",
    "/studio/image",
    ImageIcon,
  ],
  ["AI Voice", "Speech, transcription and dubbing", "/studio/audio", Mic2],
  [
    "AI Avatar",
    "Consent-safe reusable presenters",
    "/studio/avatar",
    CircleUserRound,
  ],
  [
    "Start from scratch",
    "An empty project with full control",
    "/workspace/projects",
    Layers3,
  ],
] as const;
export default function Page() {
  return (
    <div className="create-index">
      <header>
        <p className="eyebrow">
          <Sparkles size={13} />
          Create
        </p>
        <h1>Start with the outcome.</h1>
        <p>
          You don&apos;t need to know a model. Choose what you want to finish.
        </p>
      </header>
      <div>
        {choices.map(([title, copy, href, Icon], i) => (
          <Link href={href} key={href}>
            <span>{String(i + 1).padStart(2, "0")}</span>
            <Icon size={22} />
            <div>
              <h2>{title}</h2>
              <p>{copy}</p>
            </div>
            <ArrowRight size={17} />
          </Link>
        ))}
      </div>
    </div>
  );
}
