import { NextResponse } from "next/server";
import { z } from "zod";
import { apiContext, apiError } from "@/lib/api/context";
import { routeOperationModel } from "@/lib/models/registry";
import { createGeneration, failGeneration } from "@/lib/generations/service";
import { submitVideo } from "@/lib/openrouter/client";
import { getCreativeTool } from "@/lib/creative-tools";
const schema = z.object({
  script: z.string().trim().min(3).max(5000),
  operation: z.string().trim().min(2).max(80).optional(),
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
    const operation = getCreativeTool(input.operation);
    if (input.operation && operation?.mode !== "avatar") throw new Error("That avatar operation is not available.");
    const model = routeOperationModel("avatar", input.operation, "premium");
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
        operation: input.operation,
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
      // Avatar IV synthesizes/lip-syncs speech from the script itself; the
      // generic video `generate_audio` switch is not its audio contract.
      generateAudio: false,
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
