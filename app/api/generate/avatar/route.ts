import { NextResponse } from "next/server";
import { z } from "zod";
import { apiContext, apiError } from "@/lib/api/context";
import { routeModel } from "@/lib/models/registry";
import { createGeneration, failGeneration } from "@/lib/generations/service";
import { submitVideo } from "@/lib/openrouter/client";
const schema = z.object({
  script: z.string().trim().min(3).max(5000),
  referenceImage: z.string().url(),
  voiceAudio: z.string().url().optional(),
  aspectRatio: z.enum(["16:9", "9:16", "1:1"]).default("9:16"),
  duration: z.number().int().min(5).max(30).default(10),
  projectId: z.string().uuid().optional(),
  consent: z.literal(true),
  idempotencyKey: z.string().uuid().optional(),
});
export async function POST(request: Request) {
  let generationId: string | undefined;
  let context: Awaited<ReturnType<typeof apiContext>> | undefined;
  try {
    context = await apiContext("creative", request);
    const input = schema.parse(await request.json());
    const model = routeModel("avatar", "premium");
    if (!model)
      throw new Error("Avatar generation is not currently available.");
    const created = await createGeneration({
      supabase: context.supabase,
      workspaceId: context.workspaceId,
      userId: context.user.id,
      projectId: input.projectId,
      model,
      prompt: input.script,
      parameters: {
        duration: input.duration,
        aspectRatio: input.aspectRatio,
        referenceImage: input.referenceImage,
        consent: true,
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
    const job = await submitVideo({
      model: model.id,
      prompt: input.script,
      aspectRatio: input.aspectRatio,
      duration: input.duration,
      resolution: "720p",
      generateAudio: true,
      references: [
        input.referenceImage,
        ...(input.voiceAudio ? [input.voiceAudio] : []),
      ],
    });
    await context.supabase
      .from("generations")
      .update({
        status: job.status === "pending" ? "queued" : "generating",
        provider_job_id: job.id,
        provider_generation_id: job.generation_id || null,
      })
      .eq("id", generationId);
    return NextResponse.json({
      generationId,
      status: "queued",
      estimatedCredits: created.generation.credit_cost,
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
