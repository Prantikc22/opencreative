import type { Metadata } from "next";
import { Suspense } from "react";
import { IdentityDetail } from "@/components/identities/identity-detail";
import { identityDetailData } from "@/lib/data/identity-pages";
export const metadata: Metadata = { title: "Avatar identity" };
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense>
      <IdentityDetail
        kind="avatars"
        item={await identityDetailData("avatars", id)}
      />
    </Suspense>
  );
}
