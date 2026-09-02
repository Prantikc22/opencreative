import type { Metadata } from "next";
import { CampaignBuilder } from "@/components/studio/campaign-builder";
import { campaignIdentityData } from "@/lib/data/identities";
export const metadata: Metadata = { title: "Product Video" };
export default async function Page() {
  return (
    <CampaignBuilder mode="product_video" {...await campaignIdentityData()} />
  );
}
