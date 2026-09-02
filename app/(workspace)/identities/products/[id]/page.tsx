import type { Metadata } from "next";
import { Suspense } from "react";
import { IdentityDetail } from "@/components/identities/identity-detail";
import { identityDetailData } from "@/lib/data/identity-pages";
export const metadata: Metadata = { title: "Product identity" };
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense>
      <IdentityDetail
        kind="products"
        item={await identityDetailData("products", id)}
      />
    </Suspense>
  );
}
