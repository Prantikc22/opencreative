import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import { apiContext, apiError } from "@/lib/api/context";
import { getVideoJob, downloadVideo } from "@/lib/openrouter/client";
import { uploadBuffer, createDownloadUrl } from "@/lib/storage/r2";
import { completeGeneration, failGeneration } from "@/lib/generations/service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = z.object({ id: z.string().uuid() }).parse(await params);
    const context = await apiContext();
    const { data: generationData, error } = await context.supabase
      .from("generations")
      .select("*")
      .eq("id", id)
      .eq("workspace_id", context.workspaceId)
      .single();
    if (error) throw error;
    let generation = generationData;
    if (
      ["video", "avatar"].includes(generation.capability) &&
      generation.provider_job_id &&
      ["queued", "generating", "processing"].includes(generation.status)
    ) {
      const job = await getVideoJob(generation.provider_job_id);
      if (job.status === "failed") {
        await failGeneration({
          supabase: context.supabase,
          generationId: id,
          userId: context.user.id,
          error: new Error(
            job.error || "The video provider could not complete this render.",
          ),
        });
        generation = {
          ...generation,
          status: "failed",
          error_message:
            job.error || "The video provider could not complete this render.",
        };
      } else if (job.status === "completed") {
        const { data: existing } = await context.supabase
          .from("generation_assets")
          .select("asset_id")
          .eq("generation_id", id)
          .eq("role", "output")
          .limit(1)
          .maybeSingle();
        if (!existing) {
          await context.supabase
            .from("generations")
            .update({
              status: "processing",
              provider_generation_id: job.generation_id || null,
            })
            .eq("id", id);
          const output = await downloadVideo(generation.provider_job_id);
          const key = `users/${context.user.id}/videos/${id}/${randomUUID()}.mp4`;
          await uploadBuffer(key, output.bytes, output.contentType, {
            generation: id,
            model: generation.model_id,
          });
          const { data: asset, error: assetError } = await context.supabase
            .from("assets")
            .insert({
              workspace_id: context.workspaceId,
              owner_id: context.user.id,
              project_id: generation.project_id,
              generation_id: id,
              kind: "video",
              r2_key: key,
              file_name: "generated-video.mp4",
              mime_type: output.contentType,
              size_bytes: output.bytes.length,
              source: "generation",
              model_id: generation.model_id,
            })
            .select("id")
            .single();
          if (assetError) throw assetError;
          await context.supabase
            .from("generation_assets")
            .insert({ generation_id: id, asset_id: asset.id, role: "output" });
        }
        await completeGeneration({
          supabase: context.supabase,
          generationId: id,
          userId: context.user.id,
          outputMetadata: {
            provider_generation_id: job.generation_id,
            usage: job.usage,
          },
          actualCost: Number(job.usage?.cost || 0),
        });
        generation = {
          ...generation,
          status: "completed",
          provider_generation_id: job.generation_id,
          output_metadata: {
            provider_generation_id: job.generation_id,
            usage: job.usage,
          },
        };
      } else {
        const nextStatus =
          job.status === "in_progress" ? "generating" : "queued";
        if (nextStatus !== generation.status)
          await context.supabase
            .from("generations")
            .update({ status: nextStatus })
            .eq("id", id);
        generation = { ...generation, status: nextStatus };
      }
    }
    const { data: links } = await context.supabase
      .from("generation_assets")
      .select(
        "role,position,assets(id,r2_key,file_name,mime_type,kind,width,height,duration_seconds)",
      )
      .eq("generation_id", id)
      .order("position");
    const assets = [];
    for (const link of links || []) {
      const raw = Array.isArray(link.assets) ? link.assets[0] : link.assets;
      if (raw)
        assets.push({
          ...raw,
          url: await createDownloadUrl(raw.r2_key),
          role: link.role,
          position: link.position,
        });
    }
    return NextResponse.json({ generation, assets });
  } catch (cause) {
    const error = apiError(cause);
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  }
}
