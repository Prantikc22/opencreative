import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { escapeHtml, sendEmail } from "@/lib/email/resend";

type WelcomeRecipient = {
  id: string;
  email: string;
  fallbackName?: string | null;
};

export async function sendWelcomeEmailOnce(recipient: WelcomeRecipient, origin: string) {
  const admin = createAdminClient();
  const { data: profile, error } = await admin
    .from("profiles")
    .select("full_name,welcome_email_sent_at")
    .eq("id", recipient.id)
    .maybeSingle();
  if (error) throw error;
  if (!profile || profile.welcome_email_sent_at) return { sent: false, alreadySent: true };

  const { data: membership, error: membershipError } = await admin
    .from("workspace_members")
    .select("workspace_id,workspaces(plan)")
    .eq("user_id", recipient.id)
    .limit(1)
    .maybeSingle();
  if (membershipError) throw membershipError;
  const { data: wallet, error: walletError } = membership?.workspace_id
    ? await admin
        .from("credit_wallets")
        .select("balance")
        .eq("workspace_id", membership.workspace_id)
        .maybeSingle()
    : { data: null, error: null };
  if (walletError) throw walletError;
  const workspace = Array.isArray(membership?.workspaces)
    ? membership.workspaces[0]
    : membership?.workspaces;
  const plan = String(workspace?.plan || "free");
  const planLabel = plan
    .replace(/^agent-/, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
  const planName = plan.startsWith("agent-")
    ? `${planLabel} Agent plan`
    : `${planLabel} plan`;
  const creditCopy = wallet
    ? `Your ${escapeHtml(planName)} currently has <strong>${Number(wallet.balance).toLocaleString("en-US")} creative credits</strong>.`
    : "Your Marketing Studio is ready.";

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || origin).replace(/\/$/, "");
  await sendEmail({
    to: recipient.email,
    subject: "Your OpenCreative Marketing Studio is ready",
    replyTo: process.env.SUPPORT_REPLY_TO_EMAIL || "engineering@resolutexhq.com",
    html: `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#171715"><p style="color:#ff513f;font-weight:700;letter-spacing:.12em">OPENCREATIVE</p><h1 style="font-size:38px;line-height:1.05">Your Marketing Studio is ready.</h1><p style="font-size:17px;line-height:1.7">Hi ${escapeHtml(profile.full_name || recipient.fallbackName || "there")}, ${creditCopy} Create images, video, voice, music, avatars, and a support agent from one workspace.</p><p><a style="display:inline-block;background:#171715;color:white;padding:14px 20px;text-decoration:none" href="${escapeHtml(appUrl)}/app">Open your workspace</a></p></div>`,
  });

  const { error: updateError } = await admin
    .from("profiles")
    .update({ welcome_email_sent_at: new Date().toISOString() })
    .eq("id", recipient.id)
    .is("welcome_email_sent_at", null);
  if (updateError) throw updateError;
  return { sent: true, alreadySent: false };
}
