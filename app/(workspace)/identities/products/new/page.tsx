import type { Metadata } from "next";
import { IdentityForm } from "@/components/identities/identity-form";
import { brandOptions } from "@/lib/data/identity-pages";
export const metadata: Metadata = { title: "Add product" };
export default async function Page() {
  return <IdentityForm kind="products" brands={await brandOptions()} />;
}
