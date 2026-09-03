"use client";

import { LoaderCircle, Send } from "lucide-react";
import { useState } from "react";

export function SupportTicketReply({ ticketId, requesterName }: { ticketId: string; requesterName: string }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");
  async function send() {
    setState("sending"); setError("");
    const response = await fetch(`/api/support/tickets/${ticketId}/reply`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message }) });
    const data = await response.json() as { error?: string };
    if (!response.ok) { setError(data.error || "Reply could not be sent."); setState("idle"); return; }
    setState("sent"); setMessage("");
  }
  if (!open) return <button className="support-reply-toggle" type="button" onClick={() => setOpen(true)}>Reply by email <Send size={14} /></button>;
  return <div className="support-reply-composer">
    <label>Reply to {requesterName}<textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Write a helpful response…" /></label>
    <div><button type="button" onClick={() => setOpen(false)}>Cancel</button><button type="button" disabled={message.trim().length < 2 || state === "sending"} onClick={send}>{state === "sending" ? <LoaderCircle className="spin" size={14} /> : <Send size={14} />}{state === "sent" ? "Sent" : "Send reply"}</button></div>
    {error && <small role="alert">{error}</small>}
  </div>;
}
