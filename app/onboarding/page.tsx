import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OnboardingFlow } from "@/components/onboarding-flow";
import { requireUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
export const metadata: Metadata = { title: "Set up your studio", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export default async function OnboardingPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.onboarding_completed) redirect("/app");
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
