"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Bot, SendHorizontal } from "lucide-react";

type Message = { role: "agent" | "user"; text: string };
type AgentConfig = { name: string; welcome_message: string; settings?: { widget?: { accent?: string; theme?: "light" | "dark" } } };

export function EmbeddedAgentChat({ agentId }: { agentId: string }) {
  const [agent, setAgent] = useState<AgentConfig | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const sessionId = useRef<string | undefined>(undefined);

  useEffect(() => {
    void fetch(`/api/public/agents/${agentId}/chat`).then(async (response) => {
      const result = await response.json() as { agent?: AgentConfig; error?: string };
      if (!response.ok || !result.agent) throw new Error(result.error || "Agent unavailable.");
      setAgent(result.agent);
      setMessages([{ role: "agent", text: result.agent.welcome_message }]);
    }).catch((cause) => setError(cause instanceof Error ? cause.message : "Agent unavailable."));
  }, [agentId]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;
    setDraft(""); setSending(true); setError("");
    setMessages((current) => [...current, { role: "user", text }]);
    try {
      const response = await fetch(`/api/public/agents/${agentId}/chat`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, ...(sessionId.current ? { sessionId: sessionId.current } : {}) }),
      });
      const result = await response.json() as { text?: string; sessionId?: string; error?: string };
      if (!response.ok || !result.text) throw new Error(result.error || "Could not answer.");
      if (result.sessionId) sessionId.current = result.sessionId;
      setMessages((current) => [...current, { role: "agent", text: result.text! }]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not answer.");
    } finally { setSending(false); }
  }

  const accent = agent?.settings?.widget?.accent || "#ff513f";
  const theme = agent?.settings?.widget?.theme || "light";
  return <main className={`embedded-agent-chat theme-${theme}`} style={{ "--agent-accent": accent } as React.CSSProperties}>
    <header><span><Bot size={18} /></span><div><strong>{agent?.name || "Customer support"}</strong><small>{agent ? "Online" : "Connecting…"}</small></div></header>
    <section aria-live="polite">{messages.map((message, index) => <p className={message.role} key={`${index}-${message.text}`}>{message.text}</p>)}{sending && <div className="embed-typing"><i /><i /><i /></div>}</section>
    {error && <p className="embed-error">{error}</p>}
    <form onSubmit={submit}><input autoFocus value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={sending ? "Type your next question…" : "How can we help?"} /><button disabled={sending || !draft.trim()} aria-label="Send"><SendHorizontal size={18} /></button></form>
    <footer>Powered by OpenCreative</footer>
  </main>;
}
