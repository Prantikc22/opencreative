import { NextResponse } from "next/server";
import { z } from "zod";
import { apiContext, apiError } from "@/lib/api/context";
import { runAgentTurn } from "@/lib/agents/provider";

export const maxDuration = 60;

const inputSchema = z.object({
  text: z.string().trim().min(1).max(2000).optional(),
  sessionId: z.string().uuid().optional(),
  audio: z.object({
    base64: z.string().min(100).max(20_000_000),
    format: z.enum(["wav", "mp3", "flac", "m4a", "ogg", "webm", "aac"]),
  }).optional(),
  synthesize: z.boolean().optional().default(false),
}).refine((value) => value.text || value.audio, "A text or voice question is required.");

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const context = await apiContext("agents");
    const { id } = await params;
    const input = inputSchema.parse(await request.json());
    const { data: agent, error: agentError } = await context.supabase
      .from("agents")
      .select("id,name,knowledge_text,system_prompt,welcome_message,voice,language,status")
      .eq("id", id)
      .eq("workspace_id", context.workspaceId)
      .eq("status", "active")
      .single();
    if (agentError || !agent) throw new Error("Agent not found");

    let sessionId = input.sessionId;
    if (sessionId) {
      const { data: existing } = await context.supabase
        .from("agent_sessions")
        .select("id")
        .eq("id", sessionId)
        .eq("agent_id", id)
        .eq("workspace_id", context.workspaceId)
        .maybeSingle();
      if (!existing) sessionId = undefined;
    }
    if (!sessionId) {
      const { data: session, error } = await context.supabase
        .from("agent_sessions")
        .insert({ workspace_id: context.workspaceId, agent_id: id, created_by: context.user.id, channel: "studio" })
        .select("id")
        .single();
      if (error) throw error;
      sessionId = session.id;
    }

    const { data: historyRows } = await context.supabase
      .from("agent_messages")
      .select("role,content")
      .eq("session_id", sessionId)
      .eq("workspace_id", context.workspaceId)
      .order("created_at", { ascending: true })
      .limit(10);
    const history = (historyRows || [])
      .filter((row) => row.role === "user" || row.role === "assistant")
      .map((row) => ({ role: row.role as "user" | "assistant", content: row.content }));

    const result = await runAgentTurn({
      text: input.text,
      audio: input.audio,
      name: agent.name,
      knowledge: agent.knowledge_text,
      systemPrompt: agent.system_prompt,
      language: agent.language,
      voice: agent.voice,
      history,
      synthesize: input.synthesize || Boolean(input.audio),
    });
    const { error: messageError } = await context.supabase.from("agent_messages").insert([
      { workspace_id: context.workspaceId, session_id: sessionId, role: "user", content: result.transcript, input_kind: input.audio ? "voice" : "text", model_id: input.audio ? result.models.transcription : null },
      { workspace_id: context.workspaceId, session_id: sessionId, role: "assistant", content: result.text, input_kind: "text", model_id: result.models.reasoning, usage: result.usage },
    ]);
    if (messageError) throw messageError;
    await context.supabase.from("usage_events").insert({
      workspace_id: context.workspaceId,
      user_id: context.user.id,
      event_type: "agent_turn",
      capability: "agent",
      model_id: result.models.reasoning,
      quantity: result.usageSeconds / 60,
      metadata: {
        agent_id: id,
        session_id: sessionId,
        models: result.models,
        voice_input: Boolean(input.audio),
        usage_seconds: result.usageSeconds,
      },
    });
    return NextResponse.json({ ...result, sessionId });
  } catch (cause) {
    const error = apiError(cause);
    return NextResponse.json({ error: cause instanceof z.ZodError ? cause.issues[0]?.message : error.message }, { status: cause instanceof z.ZodError ? 400 : error.status });
  }
}
