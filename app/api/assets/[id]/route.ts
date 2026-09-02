import { NextResponse } from "next/server";
import { z } from "zod";
import { apiContext, apiError } from "@/lib/api/context";
import { deleteObject } from "@/lib/storage/r2";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = z.object({ id: z.string().uuid() }).parse(await params);
    const { isFavorite } = z
      .object({ isFavorite: z.boolean() })
      .parse(await request.json());
    const context = await apiContext();
    const { data, error } = await context.supabase
      .from("assets")
      .update({ is_favorite: isFavorite })
      .eq("id", id)
      .eq("workspace_id", context.workspaceId)
      .select("id,is_favorite")
      .single();
    if (error) throw error;
    return NextResponse.json({ asset: data });
  } catch (cause) {
    const error = apiError(cause);
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = z.object({ id: z.string().uuid() }).parse(await params);
    const context = await apiContext();
    const { data: asset, error } = await context.supabase
      .from("assets")
      .select("r2_key")
      .eq("id", id)
      .eq("workspace_id", context.workspaceId)
      .single();
    if (error) throw error;
    await deleteObject(asset.r2_key);
    await context.supabase
      .from("assets")
      .delete()
      .eq("id", id)
      .eq("workspace_id", context.workspaceId);
    return NextResponse.json({ ok: true });
  } catch (cause) {
    const error = apiError(cause);
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  }
}
