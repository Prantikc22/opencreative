import type { Metadata } from "next";
import { IdentityForm } from "@/components/identities/identity-form";
export const metadata: Metadata = { title: "Create avatar" };
export default function Page() {
  return <IdentityForm kind="avatars" />;
}
