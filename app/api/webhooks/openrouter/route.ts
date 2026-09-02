import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { refundCredits } from "@/lib/credits/engine";

const eventSchema = z.object({
  type: z.enum([
    "video.generation.completed",
    "video.generation.failed",
    "video.generation.cancelled",
    "video.generation.expired",
  ]),
  data: z.object({
    id: z.string(),
    status: z.string(),
    generation_id: z.string().nullable().optional(),
    model: z.string().nullable().optional(),
    error: z.string().optional(),
    usage: z
      .object({ cost: z.number().optional(), is_byok: z.boolean().optional() })
      .optional(),
  }),
});
function validSignature(raw: string, header: string, secret: string) {
  const parts = header.split(",");
  const timestamp = parts.find((p) => p.startsWith("t="))?.slice(2);
  const hash = parts.find((p) => p.startsWith("v1="))?.slice(3);
  if (!timestamp || !hash) return false;
  const age = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp));
  if (!Number.isFinite(age) || age > 300) return false;
  const expected = createHmac("sha256", secret)
    .update(`${timestamp},${raw}`)
    .digest("hex");
  return (
    expected.length === hash.length &&
    timingSafeEqual(Buffer.from(expected), Buffer.from(hash))
  );
}
export async function POST(request: Request) {
  const secret = process.env.GENERATION_WEBHOOK_SECRET;
  if (!secret)
    return NextResponse.json(
      { error: "Webhook signing is not configured." },
      { status: 503 },
    );
  const raw = await request.text();
  const signature = request.headers.get("x-openrouter-signature") || "";
  if (!validSignature(raw, signature, secret))
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  try {
    const event = eventSchema.parse(JSON.parse(raw));
    const supabase = createAdminClient();
    const { data: generation } = await supabase
      .from("generations")
      .select("id,user_id,status")
      .eq("provider_job_id", event.data.id)
      .single();
    if (!generation) return NextResponse.json({ ok: true });
    if (event.type === "video.generation.completed") {
      await supabase
        .from("generations")
        .update({
          status: "processing",
          provider_generation_id: event.data.generation_id || null,
          provider_actual_cost: event.data.usage?.cost || null,
        })
        .eq("id", generation.id);
    } else if (!["failed", "cancelled"].includes(generation.status)) {
      const status =
        event.type === "video.generation.cancelled" ? "cancelled" : "failed";
      await supabase
        .from("generations")
        .update({
          status,
          error_code: event.type,
          error_message:
            event.data.error || "Provider job ended before completion",
          completed_at: new Date().toISOString(),
        })
        .eq("id", generation.id);
      await refundCredits({
        supabase,
        userId: generation.user_id,
        generationId: generation.id,
        reason: "Provider job did not complete — credits returned",
      });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
