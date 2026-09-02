import type { Metadata } from "next";
import { CreativeStudio } from "@/components/studio/creative-studio";
export const metadata: Metadata = { title: "Avatar Studio" };
export default function Page() {
  return <CreativeStudio mode="avatar" />;
}
