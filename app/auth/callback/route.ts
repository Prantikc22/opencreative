import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

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
