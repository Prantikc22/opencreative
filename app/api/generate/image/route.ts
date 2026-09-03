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
import { generateImage } from "@/lib/openrouter/client";
import { uploadBuffer, createDownloadUrl } from "@/lib/storage/r2";
export const maxDuration = 60;
const schema = z.object({
  prompt: z.string().trim().min(3).max(8000),
  projectId: z.string().uuid().optional(),
  aspectRatio: z.enum(["1:1", "16:9", "9:16", "4:3", "3:4"]).default("1:1"),
  count: z.number().int().min(1).max(4).default(1),
  quality: z
    .enum(["fast", "standard", "premium", "advanced"])
    .default("standard"),
  advancedModel: z.string().max(200).optional(),
  references: z.array(z.string().url()).max(5).optional(),
  idempotencyKey: z.string().uuid().optional(),
});
export async function POST(request: Request) {
  let generationId = "";
  let userId = "";
  try {
    const context = await apiContext("creative");
    userId = context.user.id;
    const input = schema.parse(await request.json());
    const model = routeModel("image", input.quality, input.advancedModel);
    if (!model) throw new Error("No image model is available.");
    const created = await createGeneration({
      supabase: context.supabase,
      workspaceId: context.workspaceId,
      userId: context.user.id,
      projectId: input.projectId,
      model,
      prompt: input.prompt,
      parameters: {
        aspectRatio: input.aspectRatio,
        count: input.count,
        quality: input.quality,
      },
      idempotencyKey: input.idempotencyKey,
    });
    generationId = created.generation.id;
    if (!created.created)
      return NextResponse.json({ generation: created.generation });
    await context.supabase
      .from("generations")
      .update({ status: "generating", started_at: new Date().toISOString() })
      .eq("id", generationId);
    const result = await generateImage({
      model: model.id,
      prompt: input.prompt,
      aspectRatio: input.aspectRatio,
      count: input.count,
      quality: input.quality,
      references: input.references,
    });
    const assets = [];
    for (let i = 0; i < result.data.length; i++) {
      const output = result.data[i];
      const mime = output.media_type || "image/webp";
      const ext = mime.includes("png")
        ? "png"
        : mime.includes("jpeg")
          ? "jpg"
          : "webp";
      const bytes = Buffer.from(output.b64_json, "base64");
      const key = `users/${context.user.id}/images/${generationId}/${randomUUID()}.${ext}`;
      await uploadBuffer(key, bytes, mime, {
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
          kind: "image",
          r2_key: key,
          file_name: `generated-${i + 1}.${ext}`,
          mime_type: mime,
          size_bytes: bytes.length,
          source: "generation",
          model_id: model.id,
        })
        .select("id,r2_key,file_name,mime_type")
        .single();
      if (error) throw error;
      await context.supabase.from("generation_assets").insert({
        generation_id: generationId,
        asset_id: asset.id,
        role: "output",
        position: i,
      });
      assets.push({ ...asset, url: await createDownloadUrl(key) });
    }
    const cost = Number(
      (result.usage as { cost?: number } | undefined)?.cost || 0,
    );
    await completeGeneration({
      supabase: context.supabase,
      generationId,
      userId: context.user.id,
      outputMetadata: { count: assets.length, usage: result.usage },
      actualCost: cost,
    });
    return NextResponse.json({
      generationId,
      status: "completed",
      model: { id: model.id, displayName: model.displayName },
      assets,
    });
  } catch (cause) {
    if (generationId && userId) {
      const context = await apiContext("creative");
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
