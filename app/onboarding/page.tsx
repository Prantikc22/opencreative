import type { Metadata } from "next";
import { OnboardingFlow } from "@/components/onboarding-flow";
import { requireUser } from "@/lib/supabase/auth";
export const metadata: Metadata = { title: "Set up your studio" };
export const dynamic = "force-dynamic";
export default async function OnboardingPage() {
  const user = await requireUser();
  return (
    <OnboardingFlow
      firstName={
        String(
          user.user_metadata.full_name ||
            user.email?.split("@")[0] ||
            "Creator",
        ).split(" ")[0]
      }
    />
  );
}
