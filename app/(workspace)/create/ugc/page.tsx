import type { Metadata } from "next";
import { CampaignBuilder } from "@/components/studio/campaign-builder";
import { campaignIdentityData } from "@/lib/data/identities";
export const metadata: Metadata = { title: "Create UGC Ad" };
export default async function Page() {
  return <CampaignBuilder mode="ugc" {...await campaignIdentityData()} />;
}
