import type { Metadata } from "next";
import { AudioStudio } from "@/components/studio/audio-studio";
export const metadata: Metadata = { title: "Audio Studio" };
export default function Page() {
  return <AudioStudio />;
}
