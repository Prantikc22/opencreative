"use client";

import { FormEvent, useMemo, useState } from "react";
import { ArrowLeft, AudioLines, Check, LifeBuoy, Mic, PhoneOff, SendHorizontal, X } from "lucide-react";
import { useOpenCreativeAgent } from "@/components/marketing/use-opencreative-agent";

export function SupportAgentWidget({ agentId }: { agentId?: string } = {}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [view, setView] = useState<"chat" | "ticket">("chat");
  const [ticket, setTicket] = useState({ name: "", email: "", phone: "", message: "" });
  const [ticketState, setTicketState] = useState<{ sending: boolean; error: string; reference: string }>({ sending: false, error: "", reference: "" });
  const { messages, listening, speaking, sending, transcribing, error, ask, startListening } = useOpenCreativeAgent();
  const busy = sending || transcribing;
  const latestQuestion = useMemo(() => [...messages].reverse().find((message) => message.role === "user")?.text || "", [messages]);

  function submit(event: FormEvent) {
    event.preventDefault();
    ask(draft);
    setDraft("");
  }

  async function lodgeTicket(event: FormEvent) {
    event.preventDefault();
    setTicketState({ sending: true, error: "", reference: "" });
    try {
      const response = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...ticket, ...(agentId ? { agentId } : {}) }),
      });
      const result = await response.json() as { error?: string; ticket?: { reference: string } };
      if (!response.ok || !result.ticket) throw new Error(result.error || "We could not lodge the ticket.");
      setTicketState({ sending: false, error: "", reference: result.ticket.reference });
    } catch (cause) {
      setTicketState({ sending: false, error: cause instanceof Error ? cause.message : "We could not lodge the ticket.", reference: "" });
    }
  }

  function openTicket() {
    setTicket((current) => ({ ...current, message: current.message || latestQuestion }));
    setTicketState({ sending: false, error: "", reference: "" });
    setView("ticket");
  }

  return (
    <aside className={`support-agent ${open ? "is-open" : ""}`} aria-label="OpenCreative voice support">
      {open && (
        <div className="support-agent-panel">
          <header>
            <div className="support-agent-identity">{view === "ticket" && <button className="support-agent-back" type="button" onClick={() => setView("chat")} aria-label="Back to Nori"><ArrowLeft size={17} /></button>}<span className="support-agent-avatar"><AudioLines size={17} /></span><span><strong>{view === "ticket" ? "Support ticket" : "Nori"}</strong><small>{view === "ticket" ? "Human handoff" : "OpenCreative guide"}</small></span></div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close support"><X size={17} /></button>
          </header>
          {view === "chat" ? <>
            <div className={`support-call-stage ${speaking ? "is-speaking" : listening ? "is-listening" : transcribing ? "is-transcribing" : sending ? "is-thinking" : ""}`} aria-live="polite">
              <div className="support-call-wave" aria-hidden="true">{Array.from({ length: 19 }, (_, index) => <i key={index} />)}</div>
              <span><strong>{speaking ? "Nori is speaking" : listening ? "Listening" : transcribing ? "Writing what you said" : sending ? "Nori is thinking" : "Ready"}</strong><small>{speaking ? "Voice reply in progress" : listening ? "Tap again when you finish" : transcribing ? "Your words will appear below" : sending ? "Checking the OpenCreative guide" : "Speak or type a question"}</small></span>
            </div>
            <div className="support-agent-messages" aria-live="polite">
              {messages.slice(-6).map((message, index) => <p className={message.role} key={`${message.text}-${index}`}>{message.text}</p>)}
              {busy && <div className="support-agent-typing" aria-label={transcribing ? "Transcribing" : "Nori is thinking"}><i /><i /><i /></div>}
            </div>
            {error && <p className="support-agent-error">{error}</p>}
            <form className="support-chat-form" onSubmit={submit}>
              <button type="button" className={listening ? "is-listening" : ""} onClick={startListening} disabled={busy} aria-label={listening ? "Stop listening" : "Ask with microphone"}>{listening ? <PhoneOff size={18} /> : <Mic size={18} />}</button>
              <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Ask about OpenCreative" aria-label="Question for OpenCreative" disabled={busy} />
              <button type="submit" disabled={busy} aria-label="Send question"><SendHorizontal size={18} /></button>
            </form>
            <div className="support-agent-scope"><small>Grounded in the OpenCreative product guide</small><button type="button" onClick={openTicket}><LifeBuoy size={14} /> Lodge a ticket</button></div>
          </> : <div className="support-ticket-view">
            {ticketState.reference ? <div className="support-ticket-success"><span><Check size={24} /></span><h2>Ticket lodged.</h2><p>Reference <strong>{ticketState.reference}</strong>. The OpenCreative team can now see your request and reply to your email.</p><button type="button" onClick={() => setView("chat")}>Back to Nori</button></div>
              : <form className="support-ticket-form" onSubmit={lodgeTicket}><div><h2>Ask a human.</h2><p>Leave your details and the team will reply by email.</p></div><label>Name<input required minLength={2} value={ticket.name} onChange={(event) => setTicket({ ...ticket, name: event.target.value })} autoComplete="name" /></label><label>Email<input required type="email" value={ticket.email} onChange={(event) => setTicket({ ...ticket, email: event.target.value })} autoComplete="email" /></label><label>Phone number<input required type="tel" minLength={5} value={ticket.phone} onChange={(event) => setTicket({ ...ticket, phone: event.target.value })} autoComplete="tel" /></label><label>How can we help?<textarea required minLength={5} rows={5} value={ticket.message} onChange={(event) => setTicket({ ...ticket, message: event.target.value })} /></label>{ticketState.error && <p className="support-agent-error">{ticketState.error}</p>}<button type="submit" disabled={ticketState.sending}>{ticketState.sending ? "Lodging ticket…" : "Lodge support ticket"}<SendHorizontal size={16} /></button></form>}
          </div>}
        </div>
      )}
      <button className="support-agent-launcher" type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open}>
        <Mic size={19} /><span>Talk to Nori</span>
      </button>
    </aside>
  );
}
