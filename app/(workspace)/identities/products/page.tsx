import type { Metadata } from "next";
import { IdentityList } from "@/components/identities/identity-list";
import { identityListData } from "@/lib/data/identity-pages";
export const metadata: Metadata = { title: "Products" };
export default async function Page() {
  return (
    <IdentityList kind="products" items={await identityListData("products")} />
  );
}
