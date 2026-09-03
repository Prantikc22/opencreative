import { NextResponse } from "next/server";
import { z } from "zod";
import { apiContext, apiError } from "@/lib/api/context";
import { escapeHtml, sendEmail } from "@/lib/email/resend";

const schema = z.object({ message: z.string().trim().min(2).max(8000) });

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const { user, supabase, workspaceId } = await apiContext(undefined, request);
    const input = schema.parse(await request.json());
    const { data: ticket, error } = await supabase
      .from("support_tickets")
      .select("id,requester_name,requester_email,subject")
      .eq("id", id)
      .eq("workspace_id", workspaceId)
      .single();
    if (error || !ticket) throw new Error("Support ticket not found");
    const reference = `OC-${ticket.id.slice(0, 8).toUpperCase()}`;
    await sendEmail({
      to: ticket.requester_email,
      subject: `Re: ${ticket.subject} [${reference}]`,
      html: `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#171715"><h1 style="font-size:26px">Hi ${escapeHtml(ticket.requester_name)},</h1><div style="font-size:16px;line-height:1.7;white-space:pre-wrap">${escapeHtml(input.message)}</div><p style="margin-top:28px;color:#777">OpenCreative Support · ${reference}</p></div>`,
      replyTo: process.env.SUPPORT_REPLY_TO_EMAIL,
    });
    const { error: updateError } = await supabase.from("support_tickets").update({
      status: "pending",
      last_reply: input.message,
      last_replied_at: new Date().toISOString(),
      last_replied_by: user.id,
    }).eq("id", id).eq("workspace_id", workspaceId);
    if (updateError) throw updateError;
    return NextResponse.json({ sent: true });
  } catch (cause) {
    if (cause instanceof z.ZodError) return NextResponse.json({ error: cause.issues[0]?.message }, { status: 400 });
    const error = apiError(cause);
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
}
