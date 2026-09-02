import type { Metadata } from "next";
import { VoiceLibrary } from "@/components/voice-library";

export const metadata: Metadata = { title: "Voice library" };

export default function Page() {
  return <VoiceLibrary />;
}
