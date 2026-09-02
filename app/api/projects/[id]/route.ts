import { NextResponse } from "next/server";
import { z } from "zod";
import { apiContext, apiError } from "@/lib/api/context";
import { deleteObject } from "@/lib/storage/r2";
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = z.object({ id: z.string().uuid() }).parse(await params);
    const context = await apiContext();
    const { data: project, error } = await context.supabase
      .from("projects")
      .select("id")
      .eq("id", id)
      .eq("workspace_id", context.workspaceId)
      .single();
    if (error || !project) throw error || new Error("Project not found");
    const { data: assets } = await context.supabase
      .from("assets")
      .select("id,r2_key")
      .eq("project_id", id)
      .eq("workspace_id", context.workspaceId);
    for (const asset of assets || [])
      await deleteObject(asset.r2_key).catch(() => {});
    if (assets?.length)
      await context.supabase
        .from("assets")
        .delete()
        .in(
          "id",
          assets.map((a) => a.id),
        );
    await context.supabase
      .from("projects")
      .delete()
      .eq("id", id)
      .eq("workspace_id", context.workspaceId);
    return NextResponse.json({ ok: true, deletedAssets: assets?.length || 0 });
  } catch (cause) {
    const error = apiError(cause);
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  }
}
