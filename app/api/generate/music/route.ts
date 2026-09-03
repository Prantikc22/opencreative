import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { apiContext, apiError } from "@/lib/api/context";
import { completeGeneration, createGeneration, failGeneration } from "@/lib/generations/service";
import { routeModel } from "@/lib/models/registry";
import { generateMusic } from "@/lib/openrouter/client";
import { createDownloadUrl, uploadBuffer } from "@/lib/storage/r2";

export const maxDuration = 120;

const schema = z.object({
  prompt: z.string().trim().min(10).max(3000),
  mood: z.string().trim().min(2).max(80).default("Cinematic"),
  instrumental: z.boolean().default(true),
  quality: z.enum(["standard", "premium"]).default("standard"),
  projectId: z.string().uuid().optional(),
  idempotencyKey: z.string().uuid().optional(),
});

export async function POST(request: Request) {
  let generationId = "";
  let context: Awaited<ReturnType<typeof apiContext>> | undefined;
  try {
    context = await apiContext("creative");
    const input = schema.parse(await request.json());
    const model = routeModel("music", input.quality);
    if (!model) throw new Error("No music model is available.");
    const providerPrompt = [
      `Create an original ${input.mood.toLowerCase()} campaign soundtrack.`,
      input.prompt,
      input.instrumental ? "Instrumental only. No lyrics or spoken words." : "Vocals are allowed only when the brief asks for them.",
      "Professional mix, clear beginning and ending, suitable for a commercial brand film.",
    ].join(" ");
    const created = await createGeneration({
      supabase: context.supabase,
      workspaceId: context.workspaceId,
      userId: context.user.id,
      projectId: input.projectId,
      model,
      prompt: providerPrompt,
      parameters: { mood: input.mood, instrumental: input.instrumental, duration: input.quality === "premium" ? null : 30 },
      idempotencyKey: input.idempotencyKey,
    });
    generationId = created.generation.id;
    if (!created.created)
      return NextResponse.json({ generationId, status: created.generation.status });
    await context.supabase.from("generations").update({ status: "generating", started_at: new Date().toISOString() }).eq("id", generationId);
    const output = await generateMusic({ model: model.id, prompt: providerPrompt, format: "wav" });
    const key = `users/${context.user.id}/music/${generationId}/${randomUUID()}.wav`;
    await uploadBuffer(key, output.bytes, output.contentType, { generation: generationId, model: model.id });
    const { data: asset, error } = await context.supabase
      .from("assets")
      .insert({
        workspace_id: context.workspaceId,
        owner_id: context.user.id,
        project_id: input.projectId || null,
        generation_id: generationId,
        kind: "audio",
        r2_key: key,
        file_name: `${input.mood.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "opencreative-track"}.wav`,
        mime_type: output.contentType,
        size_bytes: output.bytes.length,
        duration_seconds: input.quality === "premium" ? null : 30,
        source: "generation",
        model_id: model.id,
        metadata: { music: true, mood: input.mood, instrumental: input.instrumental },
      })
      .select("id")
      .single();
    if (error) throw error;
    await context.supabase.from("generation_assets").insert({ generation_id: generationId, asset_id: asset.id, role: "output" });
    await completeGeneration({
      supabase: context.supabase,
      generationId,
      userId: context.user.id,
      outputMetadata: { mood: input.mood, instrumental: input.instrumental, transcript: output.transcript },
    });
    return NextResponse.json({
      generationId,
      status: "completed",
      assetId: asset.id,
      url: await createDownloadUrl(key),
      model: { id: model.id, displayName: model.displayName },
      credits: model.creditBase,
    });
  } catch (cause) {
    if (generationId && context)
      await failGeneration({ supabase: context.supabase, generationId, userId: context.user.id, error: cause }).catch(() => {});
    const error = apiError(cause);
    return NextResponse.json({ error: cause instanceof z.ZodError ? cause.issues[0]?.message : error.message }, { status: cause instanceof z.ZodError ? 400 : error.status });
  }
}
