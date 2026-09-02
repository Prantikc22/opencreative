import type { Metadata } from "next";
import { CampaignBuilder } from "@/components/studio/campaign-builder";
import { campaignIdentityData } from "@/lib/data/identities";
export const metadata: Metadata = { title: "AI Marketing Studio" };
export default async function Page() {
  return <CampaignBuilder mode="marketing" {...await campaignIdentityData()} />;
}
