"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getWorkspaceContext } from "@/lib/workspace";

const schema = z.object({ payoutEmail: z.string().email().max(254) });

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 30) || "creator";
}

export async function createAffiliateAccount(formData: FormData) {
  const { user, supabase, workspaceId, workspace } = await getWorkspaceContext();
  const { payoutEmail } = schema.parse({ payoutEmail: formData.get("payoutEmail") });
  const base = slug(String(workspace?.name || user.email?.split("@")[0] || "creator"));
  const code = `${base}-${randomUUID().slice(0, 6)}`;
  const { error } = await supabase.from("affiliate_accounts").insert({
    user_id: user.id,
    workspace_id: workspaceId,
    code,
    payout_email: payoutEmail,
  });
  if (error && error.code !== "23505") throw new Error("Affiliate signup could not be completed.");
  redirect("/account/affiliate");
}
