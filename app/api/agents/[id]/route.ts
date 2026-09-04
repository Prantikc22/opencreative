import { NextResponse } from "next/server";
import { z } from "zod";
import { apiContext, apiError } from "@/lib/api/context";

const updateSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  description: z.string().trim().max(300).optional(),
  knowledgeText: z.string().trim().min(20).max(24_000).optional(),
  systemPrompt: z.string().trim().min(10).max(2000).optional(),
  welcomeMessage: z.string().trim().min(2).max(300).optional(),
  voice: z.string().trim().min(1).max(80).optional(),
  language: z.string().trim().min(2).max(10).optional(),
  status: z.enum(["draft", "active", "paused"]).optional(),
  widget: z.object({
    accent: z.string().regex(/^#[0-9a-f]{6}$/i),
    launcherLabel: z.string().trim().min(1).max(32),
    position: z.enum(["left", "right"]),
    theme: z.enum(["light", "dark"]),
  }).optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const context = await apiContext("agents");
    const { id } = await params;
    const input = updateSchema.parse(await request.json());
    const updates: Record<string, unknown> = {};
    if (input.name !== undefined) updates.name = input.name;
    if (input.description !== undefined) updates.description = input.description;
    if (input.knowledgeText !== undefined) updates.knowledge_text = input.knowledgeText;
    if (input.systemPrompt !== undefined) updates.system_prompt = input.systemPrompt;
    if (input.welcomeMessage !== undefined) updates.welcome_message = input.welcomeMessage;
    if (input.voice !== undefined) updates.voice = input.voice;
    if (input.language !== undefined) updates.language = input.language;
    if (input.status !== undefined) updates.status = input.status;
    if (input.widget !== undefined) updates.settings = { widget: input.widget };
    const { data, error } = await context.supabase
      .from("agents")
      .update(updates)
      .eq("id", id)
      .eq("workspace_id", context.workspaceId)
      .select("id,name,description,knowledge_text,system_prompt,welcome_message,voice,language,status,settings,created_at,updated_at")
      .single();
    if (error) throw error;
    return NextResponse.json({ agent: data });
  } catch (cause) {
    const error = apiError(cause);
    return NextResponse.json({ error: cause instanceof z.ZodError ? cause.issues[0]?.message : error.message }, { status: cause instanceof z.ZodError ? 400 : error.status });
  }
}

export async function DELETE(_: Request, { params }: RouteContext) {
  try {
    const context = await apiContext("agents");
    const { id } = await params;
    const { error } = await context.supabase
      .from("agents")
      .delete()
      .eq("id", id)
      .eq("workspace_id", context.workspaceId);
    if (error) throw error;
    return NextResponse.json({ deleted: true });
  } catch (cause) {
    const error = apiError(cause);
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
}
