import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { runAgentTurn } from "@/lib/agents/provider";

export const maxDuration = 60;

const inputSchema = z.object({
  text: z.string().trim().min(1).max(1200),
  sessionId: z.string().uuid().optional(),
});

const limits = new Map<string, { count: number; resets: number }>();

function allowed(request: Request, agentId: string) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const key = `${agentId}:${ip}`;
  const now = Date.now();
  const current = limits.get(key);
  if (!current || current.resets < now) {
    limits.set(key, { count: 1, resets: now + 60_000 });
    return true;
  }
  current.count += 1;
  return current.count <= 15;
}

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: RouteContext) {
  const { id } = await params;
  const admin = createAdminClient();
  const { data: agent } = await admin.from("agents")
    .select("id,name,welcome_message,status,settings")
    .eq("id", id).eq("status", "active").maybeSingle();
  if (!agent) return NextResponse.json({ error: "Agent not found." }, { status: 404 });
  return NextResponse.json({ agent });
}

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    if (!allowed(request, id)) return NextResponse.json({ error: "Please wait a moment before asking again." }, { status: 429 });
    const input = inputSchema.parse(await request.json());
    const admin = createAdminClient();
    const { data: agent, error: agentError } = await admin.from("agents")
      .select("id,workspace_id,created_by,name,knowledge_text,system_prompt,welcome_message,voice,language,status")
      .eq("id", id).eq("status", "active").single();
    if (agentError || !agent) return NextResponse.json({ error: "Agent not found." }, { status: 404 });

    let sessionId = input.sessionId;
    if (sessionId) {
      const { data: existing } = await admin.from("agent_sessions").select("id").eq("id", sessionId).eq("agent_id", id).maybeSingle();
      if (!existing) sessionId = undefined;
    }
    if (!sessionId) {
      const { data: session, error } = await admin.from("agent_sessions").insert({
        workspace_id: agent.workspace_id, agent_id: id, created_by: agent.created_by, channel: "web",
        metadata: { embedded: true },
      }).select("id").single();
      if (error) throw error;
      sessionId = session.id;
    }
    const { data: rows } = await admin.from("agent_messages").select("role,content")
      .eq("session_id", sessionId).order("created_at", { ascending: true }).limit(10);
    const history = (rows || []).filter((row) => row.role === "user" || row.role === "assistant")
      .map((row) => ({ role: row.role as "user" | "assistant", content: row.content }));
    const result = await runAgentTurn({
      text: input.text, name: agent.name, knowledge: agent.knowledge_text,
      systemPrompt: agent.system_prompt, language: agent.language, voice: agent.voice, history, synthesize: false,
    });
    await admin.from("agent_messages").insert([
      { workspace_id: agent.workspace_id, session_id: sessionId, role: "user", content: input.text, input_kind: "text" },
      { workspace_id: agent.workspace_id, session_id: sessionId, role: "assistant", content: result.text, input_kind: "text", model_id: result.models.reasoning, usage: result.usage },
    ]);
    await admin.from("usage_events").insert({
      workspace_id: agent.workspace_id, user_id: agent.created_by, event_type: "agent_turn", capability: "agent",
      model_id: result.models.reasoning, quantity: result.usageSeconds / 60,
      metadata: { agent_id: id, session_id: sessionId, channel: "web", models: result.models },
    });
    return NextResponse.json({ text: result.text, transcript: input.text, sessionId });
  } catch (cause) {
    const message = cause instanceof z.ZodError ? cause.issues[0]?.message : cause instanceof Error ? cause.message : "The agent could not answer.";
    return NextResponse.json({ error: message }, { status: cause instanceof z.ZodError ? 400 : 500 });
  }
}
