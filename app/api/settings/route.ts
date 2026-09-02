import { NextResponse } from "next/server";
import { z } from "zod";
import { apiContext, apiError } from "@/lib/api/context";

const schema = z.object({
  fullName: z.string().trim().min(1).max(120).optional(),
  workspaceName: z.string().trim().min(1).max(120).optional(),
  defaultQuality: z.enum(["fast", "standard", "premium"]).optional(),
});

export async function PATCH(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const context = await apiContext();
    if (input.fullName) {
      const { error } = await context.supabase
        .from("profiles")
        .update({ full_name: input.fullName })
        .eq("id", context.user.id);
      if (error) throw error;
    }
    if (input.workspaceName || input.defaultQuality) {
      const { data: workspace, error: readError } = await context.supabase
        .from("workspaces")
        .select("settings")
        .eq("id", context.workspaceId)
        .single();
      if (readError) throw readError;
      const settings = {
        ...((workspace.settings as Record<string, unknown>) || {}),
        ...(input.defaultQuality
          ? { defaultQuality: input.defaultQuality }
          : {}),
      };
      const { error } = await context.supabase
        .from("workspaces")
        .update({
          ...(input.workspaceName ? { name: input.workspaceName } : {}),
          settings,
        })
        .eq("id", context.workspaceId);
      if (error) throw error;
    }
    return NextResponse.json({ ok: true });
  } catch (cause) {
    const error = apiError(cause);
    return NextResponse.json(
      { error: error.message },
      { status: cause instanceof z.ZodError ? 400 : error.status },
    );
  }
}
