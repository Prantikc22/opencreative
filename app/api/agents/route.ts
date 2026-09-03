import { NextResponse } from "next/server";
import { z } from "zod";
import { apiContext, apiError } from "@/lib/api/context";

const createSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(300).default(""),
  knowledgeText: z.string().trim().min(20).max(24_000),
  systemPrompt: z.string().trim().min(10).max(2000).default("Answer accurately and concisely from the approved knowledge only."),
  welcomeMessage: z.string().trim().min(2).max(300).default("Hello. How can I help?"),
  voice: z.string().trim().min(1).max(80).default("Kore"),
  language: z.string().trim().min(2).max(10).default("en"),
});

export async function GET() {
  try {
    const context = await apiContext("agents");
    const { data, error } = await context.supabase
      .from("agents")
      .select("id,name,description,knowledge_text,system_prompt,welcome_message,voice,language,status,created_at,updated_at")
      .eq("workspace_id", context.workspaceId)
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ agents: data || [] });
  } catch (cause) {
    const error = apiError(cause);
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
}

export async function POST(request: Request) {
  try {
    const context = await apiContext("agents");
    const input = createSchema.parse(await request.json());
    const { data, error } = await context.supabase
      .from("agents")
      .insert({
        workspace_id: context.workspaceId,
        created_by: context.user.id,
        name: input.name,
        description: input.description,
        knowledge_text: input.knowledgeText,
        system_prompt: input.systemPrompt,
        welcome_message: input.welcomeMessage,
        voice: input.voice,
        language: input.language,
        status: "active",
      })
      .select("id,name,description,knowledge_text,system_prompt,welcome_message,voice,language,status,created_at,updated_at")
      .single();
    if (error) throw error;
    return NextResponse.json({ agent: data }, { status: 201 });
  } catch (cause) {
    const error = apiError(cause);
    return NextResponse.json({ error: cause instanceof z.ZodError ? cause.issues[0]?.message : error.message }, { status: cause instanceof z.ZodError ? 400 : error.status });
  }
}
