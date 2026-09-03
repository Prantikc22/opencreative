import { NextResponse } from "next/server";
import { z } from "zod";
import { apiContext, apiError } from "@/lib/api/context";
import { routeModel } from "@/lib/models/registry";
import {
  createGeneration,
  completeGeneration,
  failGeneration,
} from "@/lib/generations/service";
import { transcribeAudio } from "@/lib/openrouter/client";
export const maxDuration = 60;
const schema = z.object({
  base64: z.string().min(100).max(50_000_000),
  format: z.enum(["wav", "mp3", "flac", "m4a", "ogg", "webm", "aac"]),
  language: z.string().length(2).optional(),
  durationSeconds: z.number().positive().max(3600).optional(),
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
    const model = routeModel("transcription", input.quality);
    if (!model) throw new Error("No transcription model is available.");
    const created = await createGeneration({
      supabase: context.supabase,
      workspaceId: context.workspaceId,
      userId: context.user.id,
      projectId: input.projectId,
      model,
      prompt: "Transcribe uploaded audio",
      parameters: {
        durationSeconds: input.durationSeconds || 60,
        format: input.format,
        language: input.language,
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
    const result = await transcribeAudio({
      model: model.id,
      base64: input.base64,
      format: input.format,
      language: input.language,
    });
    await completeGeneration({
      supabase: context.supabase,
      generationId,
      userId: context.user.id,
      outputMetadata: {
        transcript: result.text,
        language: result.language,
        duration: result.duration,
        segments: result.segments,
        usage: result.usage,
      },
    });
    return NextResponse.json({
      generationId,
      status: "completed",
      transcript: result.text,
      language: result.language,
      segments: result.segments,
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
