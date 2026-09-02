import { NextResponse } from "next/server";
import { z } from "zod";
import { apiContext, apiError } from "@/lib/api/context";
import { routeModel } from "@/lib/models/registry";
import { createGeneration, failGeneration } from "@/lib/generations/service";
import { submitVideo } from "@/lib/openrouter/client";
const schema = z.object({
  prompt: z.string().trim().min(3).max(8000),
  projectId: z.string().uuid().optional(),
  sceneId: z.string().uuid().optional(),
  aspectRatio: z.enum(["16:9", "9:16", "1:1"]).default("16:9"),
  duration: z.number().int().min(3).max(10).default(5),
  resolution: z.enum(["480p", "720p", "1080p"]).default("720p"),
  generateAudio: z.boolean().default(true),
  quality: z
    .enum(["fast", "standard", "premium", "advanced"])
    .default("standard"),
  advancedModel: z.string().max(200).optional(),
  firstFrame: z.string().url().optional(),
  references: z.array(z.string().url()).max(5).optional(),
  idempotencyKey: z.string().uuid().optional(),
});
export async function POST(request: Request) {
  let generationId: string | undefined;
  let userId: string | undefined;
  try {
    const context = await apiContext();
    userId = context.user.id;
    const input = schema.parse(await request.json());
    const model = routeModel("video", input.quality, input.advancedModel);
    if (!model) throw new Error("No video model is available.");
    if (
      model.supportedDurations &&
      !model.supportedDurations.includes(input.duration)
    )
      throw new Error(
        `Unsupported duration. ${model.displayName} supports ${model.supportedDurations.join(", ")} seconds.`,
      );
    const created = await createGeneration({
      supabase: context.supabase,
      workspaceId: context.workspaceId,
      userId: context.user.id,
      projectId: input.projectId,
      sceneId: input.sceneId,
      model,
      prompt: input.prompt,
      parameters: {
        aspectRatio: input.aspectRatio,
        duration: input.duration,
        resolution: input.resolution,
        generateAudio: input.generateAudio,
        quality: input.quality,
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
      prompt: input.prompt,
      aspectRatio: input.aspectRatio,
      duration: input.duration,
      resolution: input.resolution,
      generateAudio: input.generateAudio,
      firstFrame: input.firstFrame,
      references: input.references,
      callbackUrl:
        process.env.GENERATION_WEBHOOK_SECRET &&
        process.env.NEXT_PUBLIC_APP_URL?.startsWith("https://")
          ? `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/openrouter`
          : undefined,
    });
    await context.supabase
      .from("generations")
      .update({
        status: job.status === "pending" ? "queued" : "generating",
        provider_job_id: job.id,
        provider_generation_id: job.generation_id || null,
        output_metadata: { polling_url: job.polling_url },
      })
      .eq("id", generationId);
    return NextResponse.json({
      generationId,
      status: "queued",
      providerJobId: job.id,
      estimatedCredits: created.generation.credit_cost,
      model: { id: model.id, displayName: model.displayName },
    });
  } catch (cause) {
    if (generationId && userId) {
      const context = await apiContext();
      await failGeneration({
        supabase: context.supabase,
        generationId,
        userId,
        error: cause,
      }).catch(() => {});
    }
    const error = apiError(cause);
    return NextResponse.json(
      { error: error.message },
      { status: cause instanceof z.ZodError ? 400 : error.status },
    );
  }
}
