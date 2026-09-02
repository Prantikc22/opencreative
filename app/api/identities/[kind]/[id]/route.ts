import { NextResponse } from "next/server";
import { z } from "zod";
import { apiContext, apiError } from "@/lib/api/context";
const paramsSchema = z.object({
  kind: z.enum(["brands", "products", "avatars"]),
  id: z.string().uuid(),
});
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ kind: string; id: string }> },
) {
  try {
    const p = paramsSchema.parse(await params);
    const context = await apiContext();
    const { data, error } = await context.supabase
      .from(p.kind)
      .select("*")
      .eq("id", p.id)
      .eq("workspace_id", context.workspaceId)
      .single();
    if (error) throw error;
    return NextResponse.json({ item: data });
  } catch (cause) {
    const error = apiError(cause);
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  }
}
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ kind: string; id: string }> },
) {
  try {
    const p = paramsSchema.parse(await params);
    const context = await apiContext();
    const body = await request.json();
    const allowed: Record<string, string[]> = {
      brands: [
        "name",
        "website",
        "industry",
        "description",
        "positioning",
        "target_audience",
        "colors",
        "typography",
        "tone",
        "visual_style",
        "preferred_phrases",
        "banned_phrases",
      ],
      products: [
        "name",
        "brand_id",
        "description",
        "features",
        "usp",
        "price",
        "target_audience",
        "usage",
      ],
      avatars: [
        "name",
        "default_voice_id",
        "appearance",
        "personality",
        "speaking_style",
        "preferred_language",
        "tags",
      ],
    };
    const patch = Object.fromEntries(
      Object.entries(body).filter(([key]) => allowed[p.kind].includes(key)),
    );
    if (!Object.keys(patch).length)
      return NextResponse.json(
        { error: "No editable fields provided." },
        { status: 400 },
      );
    const { error } = await context.supabase
      .from(p.kind)
      .update(patch)
      .eq("id", p.id)
      .eq("workspace_id", context.workspaceId);
    if (error) throw error;
    return NextResponse.json({ ok: true });
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
  { params }: { params: Promise<{ kind: string; id: string }> },
) {
  try {
    const p = paramsSchema.parse(await params);
    const context = await apiContext();
    const { error } = await context.supabase
      .from(p.kind)
      .delete()
      .eq("id", p.id)
      .eq("workspace_id", context.workspaceId);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (cause) {
    const error = apiError(cause);
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  }
}
