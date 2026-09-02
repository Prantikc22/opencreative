import { NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "crypto";
import { apiContext, apiError } from "@/lib/api/context";
import { cleanFileName } from "@/lib/utils";
import { createDownloadUrl, createUploadUrl } from "@/lib/storage/r2";

const uploadSchema = z.object({
  action: z.literal("upload"),
  fileName: z.string().min(1).max(180),
  mimeType: z.string(),
  size: z
    .number()
    .int()
    .positive()
    .max(250 * 1024 * 1024),
  category: z.enum([
    "uploads",
    "brands",
    "products",
    "avatars",
    "images",
    "videos",
    "audio",
    "exports",
  ]),
});
const downloadSchema = z.object({
  action: z.literal("download"),
  assetId: z.string().uuid(),
});
const schema = z.discriminatedUnion("action", [uploadSchema, downloadSchema]);
const allowed = [
  /^image\/(png|jpeg|webp|gif)$/,
  /^video\/(mp4|webm|quicktime)$/,
  /^audio\/(mpeg|wav|x-wav|mp4|ogg|webm|aac)$/,
  /^application\/pdf$/,
];
export async function POST(request: Request) {
  try {
    const context = await apiContext();
    const input = schema.parse(await request.json());
    if (input.action === "upload") {
      if (!allowed.some((rule) => rule.test(input.mimeType)))
        return NextResponse.json(
          { error: "That file type is not supported." },
          { status: 415 },
        );
      const key = `users/${context.user.id}/${input.category}/${randomUUID()}-${cleanFileName(input.fileName)}`;
      const uploadUrl = await createUploadUrl(key, input.mimeType);
      const { data: asset, error } = await context.supabase
        .from("assets")
        .insert({
          workspace_id: context.workspaceId,
          owner_id: context.user.id,
          kind: input.mimeType.startsWith("image")
            ? "image"
            : input.mimeType.startsWith("video")
              ? "video"
              : input.mimeType.startsWith("audio")
                ? "audio"
                : "document",
          r2_key: key,
          file_name: cleanFileName(input.fileName),
          mime_type: input.mimeType,
          size_bytes: input.size,
          source: "upload",
          metadata: { upload_pending: true },
        })
        .select("id")
        .single();
      if (error) throw error;
      return NextResponse.json({ assetId: asset.id, key, uploadUrl });
    }
    const { data: asset, error } = await context.supabase
      .from("assets")
      .select("r2_key")
      .eq("id", input.assetId)
      .eq("workspace_id", context.workspaceId)
      .is("deleted_at", null)
      .single();
    if (error) throw error;
    return NextResponse.json({
      downloadUrl: await createDownloadUrl(asset.r2_key),
    });
  } catch (cause) {
    const error = apiError(cause);
    return NextResponse.json(
      { error: error.message },
      { status: cause instanceof z.ZodError ? 400 : error.status },
    );
  }
}
