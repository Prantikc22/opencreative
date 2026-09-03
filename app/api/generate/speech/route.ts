import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import { apiContext, apiError } from "@/lib/api/context";
import { routeModel } from "@/lib/models/registry";
import {
  createGeneration,
  completeGeneration,
  failGeneration,
} from "@/lib/generations/service";
import { synthesizeSpeech } from "@/lib/openrouter/client";
import { createDownloadUrl, uploadBuffer } from "@/lib/storage/r2";
export const maxDuration = 60;
const schema = z.object({
  text: z.string().trim().min(1).max(10000),
  voice: z.string().min(1).max(200).default("alloy"),
  speed: z.number().min(0.7).max(1.3).default(1),
  quality: z.enum(["fast", "standard", "premium"]).default("standard"),
  projectId: z.string().uuid().optional(),
  idempotencyKey: z.string().uuid().optional(),
});
export async function POST(request: Request) {
  let generationId = "";
  let context: Awaited<ReturnType<typeof apiContext>> | undefined;
  try {
    context = await apiContext("creative");
    const input = schema.parse(await request.json());
    const model = routeModel("speech", input.quality);
    if (!model) throw new Error("No speech model is available.");
    const created = await createGeneration({
      supabase: context.supabase,
      workspaceId: context.workspaceId,
      userId: context.user.id,
      projectId: input.projectId,
      model,
      prompt: input.text,
      parameters: {
        characters: input.text.length,
        voice: input.voice,
        speed: input.speed,
      },
      idempotencyKey: input.idempotencyKey,
    });
    generationId = created.generation.id;
    if (!created.created)
      return NextResponse.json({
        generationId,
        status: created.generation.status,
      });
    await context.supabase
      .from("generations")
      .update({ status: "generating", started_at: new Date().toISOString() })
      .eq("id", generationId);
    const output = await synthesizeSpeech({
      model: model.id,
      text: input.text,
      voice: input.voice,
      speed: input.speed,
      format: "mp3",
    });
    const ext = output.contentType.includes("wav") ? "wav" : "mp3";
    const key = `users/${context.user.id}/audio/${generationId}/${randomUUID()}.${ext}`;
    await uploadBuffer(key, output.bytes, output.contentType, {
      generation: generationId,
      model: model.id,
    });
    const { data: asset, error } = await context.supabase
      .from("assets")
      .insert({
        workspace_id: context.workspaceId,
        owner_id: context.user.id,
        project_id: input.projectId || null,
        generation_id: generationId,
        kind: "audio",
        r2_key: key,
        file_name: `voiceover.${ext}`,
        mime_type: output.contentType,
        size_bytes: output.bytes.length,
        source: "generation",
        model_id: model.id,
      })
      .select("id")
      .single();
    if (error) throw error;
    await context.supabase.from("generation_assets").insert({
      generation_id: generationId,
      asset_id: asset.id,
      role: "output",
    });
    await completeGeneration({
      supabase: context.supabase,
      generationId,
      userId: context.user.id,
      outputMetadata: { voice: input.voice },
    });
    return NextResponse.json({
      generationId,
      status: "completed",
      assetId: asset.id,
      url: await createDownloadUrl(key),
      model: { id: model.id, displayName: model.displayName },
    });
  } catch (cause) {
    if (generationId && context)
      await failGeneration({
        supabase: context.supabase,
        generationId,
        userId: context.user.id,
        error: cause,
      }).catch(() => {});
    const error = apiError(cause);
    return NextResponse.json(
      { error: error.message },
      { status: cause instanceof z.ZodError ? 400 : error.status },
    );
  }
}
