import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const ticketSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(320),
  phone: z.string().trim().min(5).max(40),
  message: z.string().trim().min(5).max(4000),
  subject: z.string().trim().min(2).max(160).optional(),
  agentId: z.string().uuid().optional(),
});

const buckets = new Map<string, { count: number; resets: number }>();

function allowRequest(request: Request) {
  const key = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resets < now) {
    buckets.set(key, { count: 1, resets: now + 60 * 60 * 1000 });
    return true;
  }
  current.count += 1;
  return current.count <= 5;
}

async function platformWorkspaceId() {
  const configured = process.env.OPENCREATIVE_SUPPORT_WORKSPACE_ID?.trim();
  if (configured) return configured;
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("workspaces")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error || !data?.id)
    throw new Error("The support inbox is not configured yet.");
  return data.id as string;
}

export async function POST(request: Request) {
  try {
    if (!allowRequest(request))
      return NextResponse.json({ error: "Too many tickets. Please try again later." }, { status: 429 });
    const input = ticketSchema.parse(await request.json());
    const admin = createAdminClient();
    let workspaceId = await platformWorkspaceId();

    if (input.agentId) {
      const { data: agent } = await admin
        .from("agents")
        .select("workspace_id,status")
        .eq("id", input.agentId)
        .eq("status", "active")
        .maybeSingle();
      if (!agent) return NextResponse.json({ error: "This support agent is not available." }, { status: 404 });
      workspaceId = agent.workspace_id as string;
    }

    const { data, error } = await admin
      .from("support_tickets")
      .insert({
        workspace_id: workspaceId,
        agent_id: input.agentId || null,
        requester_name: input.name,
        requester_email: input.email.toLowerCase(),
        requester_phone: input.phone,
        subject: input.subject || "OpenCreative support request",
        message: input.message,
        source: input.agentId ? "agent_widget" : "nori_widget",
        metadata: { userAgent: request.headers.get("user-agent")?.slice(0, 300) || "" },
      })
      .select("id,created_at")
      .single();
    if (error) throw error;
    return NextResponse.json({
      ticket: { id: data.id, reference: `OC-${String(data.id).slice(0, 8).toUpperCase()}`, createdAt: data.created_at },
    }, { status: 201 });
  } catch (cause) {
    if (cause instanceof z.ZodError)
      return NextResponse.json({ error: cause.issues[0]?.message || "Check the ticket details." }, { status: 400 });
    console.error("Support ticket error", cause);
    return NextResponse.json({
      error: cause instanceof Error && cause.message.includes("not configured")
        ? cause.message
        : "We could not lodge the ticket. Please use the support page for now.",
    }, { status: 503 });
  }
}
