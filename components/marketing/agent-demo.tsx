"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowRight, Mic, Send, Square, Volume2 } from "lucide-react";
import { useOpenCreativeAgent } from "@/components/marketing/use-opencreative-agent";

export function AgentDemo() {
  const [draft, setDraft] = useState("How does OpenCreative pricing work?");
  const { messages, listening, speaking, sending, error, ask, startListening } = useOpenCreativeAgent();

  function submit(event: FormEvent) {
    event.preventDefault();
    ask(draft);
    setDraft("");
  }

  return (
    <div className="agent-demo-2026">
      <div className="agent-phone-2026">
        <header><span>NORI · OPENCREATIVE GUIDE</span><small>{speaking ? "SPEAKING" : listening ? "LISTENING" : sending ? "THINKING" : "READY"}</small></header>
        <button className={`agent-orb-2026 ${listening ? "listening" : ""}`} type="button" onClick={startListening} disabled={sending} aria-label={listening ? "Stop listening" : "Ask with microphone"}><i /><i />{listening ? <Square size={31} /> : <Mic size={34} />}</button>
        <strong>{listening ? "I am listening" : speaking ? "Answering now" : sending ? "Thinking from product knowledge" : "Ask about OpenCreative"}</strong>
        <p>{error || "Your recording is transcribed, answered, and spoken through the OpenRouter production stack."}</p>
        <span className="agent-privacy">GPT-4o Mini Transcribe · Gemini reasoning · Gemini voice</span>
      </div>
      <div className="agent-widget-2026">
        <header><div><Volume2 size={18} /><strong>Nori · OpenCreative Support</strong></div><span>ONLINE</span></header>
        <div className="agent-chat-2026">{messages.slice(-5).map((message, index) => <p className={message.role === "user" ? "customer" : "agent"} key={`${message.text}-${index}`}>{message.text}</p>)}</div>
        <form className="agent-input-2026" onSubmit={submit}><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Ask about products, pricing, or credits" aria-label="Question for OpenCreative support" disabled={sending} /><button type="button" onClick={startListening} aria-label="Ask by voice" disabled={sending}><Mic size={18} /></button><button type="submit" aria-label="Send question" disabled={sending}><Send size={18} /></button></form>
        <footer><span>OpenCreative knowledge connected</span><span>Voice and text enabled</span></footer>
        <Link href="/studio/agents">Build a support agent <ArrowRight size={15} /></Link>
      </div>
    </div>
  );
}
