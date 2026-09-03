"use client";

import { FormEvent, useState } from "react";
import { AudioLines, Mic, PhoneOff, SendHorizontal, X } from "lucide-react";
import { useOpenCreativeAgent } from "@/components/marketing/use-opencreative-agent";

export function SupportAgentWidget() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const { messages, listening, speaking, sending, error, ask, startListening } = useOpenCreativeAgent();

  function submit(event: FormEvent) {
    event.preventDefault();
    ask(draft);
    setDraft("");
  }

  return (
    <aside className={`support-agent ${open ? "is-open" : ""}`} aria-label="OpenCreative voice support">
      {open && (
        <div className="support-agent-panel">
          <header>
            <div className="support-agent-identity"><span className="support-agent-avatar"><AudioLines size={17} /></span><span><strong>Nori</strong><small>OpenCreative guide</small></span></div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close support"><X size={17} /></button>
          </header>
          <div className={`support-call-stage ${speaking ? "is-speaking" : listening ? "is-listening" : ""}`} aria-live="polite">
            <div className="support-call-wave" aria-hidden="true">{Array.from({ length: 19 }, (_, index) => <i key={index} />)}</div>
            <strong>{speaking ? "Nori is speaking" : listening ? "You are speaking" : sending ? "Nori is thinking" : "Ready when you are"}</strong>
            <small>{speaking ? "Provider-generated voice" : listening ? "Recording through this device" : sending ? "Grounding the answer in OpenCreative" : "Tap the microphone to start"}</small>
          </div>
          <div className="support-agent-messages">
            {messages.slice(-4).map((message, index) => <p className={message.role} key={`${message.text}-${index}`}>{message.text}</p>)}
          </div>
          {error && <p className="support-agent-error">{error}</p>}
          <form onSubmit={submit}>
            <button type="button" className={listening ? "is-listening" : ""} onClick={startListening} disabled={sending} aria-label={listening ? "Stop listening" : "Ask with microphone"}>{listening ? <PhoneOff size={18} /> : <Mic size={18} />}</button>
            <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Ask about OpenCreative" aria-label="Question for OpenCreative" disabled={sending} />
            <button type="submit" disabled={sending} aria-label="Send question"><SendHorizontal size={18} /></button>
          </form>
          <small className="support-agent-scope">Answers only from the OpenCreative product guide</small>
        </div>
      )}
      <button className="support-agent-launcher" type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open}>
        <Mic size={19} /><span>Talk to Nori</span>
      </button>
    </aside>
  );
}
