import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendWelcomeEmailOnce } from "@/lib/email/welcome";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  try {
    const result = await sendWelcomeEmailOnce({
      id: user.id,
      email: user.email,
      fallbackName: typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null,
    }, new URL(request.url).origin);
    return NextResponse.json(result);
  } catch (cause) {
    console.error("Welcome email error", cause);
    return NextResponse.json({ error: "Welcome email could not be delivered." }, { status: 502 });
  }
}
