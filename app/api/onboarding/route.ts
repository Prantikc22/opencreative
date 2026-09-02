import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { assertSafeHttpUrl } from "@/lib/security/guard";

const schema = z.object({
  intent: z.enum([
    "ugc",
    "product_ad",
    "marketing_video",
    "ai_video",
    "ai_images",
    "avatar",
    "voice",
    "explore",
  ]),
  brandMode: z.enum(["website", "upload", "skip"]),
  website: z.string().max(2048).optional(),
});
export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const input = schema.parse(await request.json());
    if (input.brandMode === "website" && input.website)
      assertSafeHttpUrl(input.website);
    const supabase = await createClient();
    const { data: member, error: memberError } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", user.id)
      .limit(1)
      .single();
    if (memberError) throw memberError;
    await supabase
      .from("profiles")
      .update({ onboarding_completed: true, primary_intent: input.intent })
      .eq("id", user.id);
    if (input.brandMode === "website" && input.website) {
      const name = new URL(input.website).hostname
        .replace(/^www\./, "")
        .split(".")[0]
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      const { data: brand, error } = await supabase
        .from("brands")
        .insert({
          workspace_id: member.workspace_id,
          created_by: user.id,
          name,
          website: input.website,
          status: "analyzing",
        })
        .select("id")
        .single();
      if (error) throw error;
      return NextResponse.json({
        next: `/identities/brands/${brand.id}?analyze=1`,
      });
    }
    return NextResponse.json({
      next: input.brandMode === "upload" ? "/identities/brands/new" : "/app",
    });
  } catch (cause) {
    return NextResponse.json(
      {
        error:
          cause instanceof Error
            ? cause.message
            : "Could not complete onboarding.",
      },
      { status: cause instanceof z.ZodError ? 400 : 500 },
    );
  }
}
