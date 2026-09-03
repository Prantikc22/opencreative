import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const safeCode = code.toLowerCase();
  if (/^[a-z0-9-]{4,48}$/.test(safeCode)) {
    const supabase = await createClient();
    await supabase.rpc("record_affiliate_click", { referral_code: safeCode });
  }
  const response = NextResponse.redirect(new URL("/", request.url));
  if (/^[a-z0-9-]{4,48}$/.test(safeCode)) response.cookies.set("opencreative_ref", safeCode, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 30, path: "/" });
  return response;
}
