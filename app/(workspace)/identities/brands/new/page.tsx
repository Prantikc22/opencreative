import type { Metadata } from "next";
import { IdentityForm } from "@/components/identities/identity-form";
export const metadata: Metadata = { title: "Create brand" };
export default function Page() {
  return <IdentityForm kind="brands" />;
}
