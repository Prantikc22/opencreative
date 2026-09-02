import type { Metadata } from "next";
import { Suspense } from "react";
import { IdentityDetail } from "@/components/identities/identity-detail";
import { identityDetailData } from "@/lib/data/identity-pages";
export const metadata: Metadata = { title: "Brand DNA" };
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense>
      <IdentityDetail
        kind="brands"
        item={await identityDetailData("brands", id)}
      />
    </Suspense>
  );
}
