import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { escapeHtml, sendEmail } from "@/lib/email/resend";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next")?.startsWith("/")
    ? url.searchParams.get("next")!
    : "/app";
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email && process.env.RESEND_API_KEY) {
        const admin = createAdminClient();
        const { data: profile } = await admin.from("profiles").select("full_name,welcome_email_sent_at").eq("id", user.id).maybeSingle();
        if (profile && !profile.welcome_email_sent_at) {
          await sendEmail({
            to: user.email,
            subject: "Welcome to OpenCreative",
            html: `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#171715"><p style="color:#ff513f;font-weight:700;letter-spacing:.12em">OPENCREATIVE</p><h1 style="font-size:38px;line-height:1.05">Your creative workspace is ready.</h1><p style="font-size:17px;line-height:1.7">Hi ${escapeHtml(profile.full_name || "there")}, start with your 50 welcome credits, build a brand memory, or connect your own creative agent through MCP.</p><p><a style="display:inline-block;background:#171715;color:white;padding:14px 20px;text-decoration:none" href="${process.env.NEXT_PUBLIC_APP_URL || url.origin}/app">Open your workspace</a></p></div>`,
          }).then(() => admin.from("profiles").update({ welcome_email_sent_at: new Date().toISOString() }).eq("id", user.id)).catch((cause) => console.error("Welcome email error", cause));
        }
      }
      const cookieStore = await cookies();
      const referralCode = cookieStore.get("opencreative_ref")?.value;
      if (referralCode) await supabase.rpc("record_affiliate_conversion", { referral_code: referralCode });
      const response = NextResponse.redirect(new URL(next, url.origin));
      if (referralCode) response.cookies.delete("opencreative_ref");
      return response;
    }
  }
  return NextResponse.redirect(
    new URL("/login?error=auth_callback_failed", url.origin),
  );
}
