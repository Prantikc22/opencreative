"use client";

import { FormEvent, useEffect, useState } from "react";
import { Bot, FileText, Globe2, LoaderCircle, Mic, Plus, Save, Send, Trash2, Upload } from "lucide-react";
import { useOpenCreativeAgent } from "@/components/marketing/use-opencreative-agent";
import { CopyButton } from "@/components/copy-button";
import type { AgentResource } from "@/lib/agents/knowledge";

type WidgetSettings = {
  accent?: string;
  launcherLabel?: string;
  position?: "left" | "right";
  theme?: "light" | "dark";
};

type SavedAgent = {
  id: string;
  name: string;
  description: string;
  knowledge_text: string;
  system_prompt: string;
  welcome_message: string;
  voice: string;
  language: string;
  status: "draft" | "active" | "paused";
  settings?: { widget?: WidgetSettings; resources?: AgentResource[] };
};

const blankAgent = {
  name: "Product Guide",
  description: "Answers product questions from approved company knowledge.",
  knowledge: "Add your product facts, policies, plans, support instructions, and handoff rules here.",
  systemPrompt: "Answer accurately and concisely from the approved knowledge only.",
  welcomeMessage: "Hello. How can I help with our product today?",
  voice: "Kore",
  language: "en",
};

export function AgentStudio() {
  const [agents, setAgents] = useState<SavedAgent[]>([]);
  const [agentId, setAgentId] = useState("");
  const [name, setName] = useState(blankAgent.name);
  const [description, setDescription] = useState(blankAgent.description);
  const [knowledge, setKnowledge] = useState(blankAgent.knowledge);
  const [systemPrompt, setSystemPrompt] = useState(blankAgent.systemPrompt);
  const [welcomeMessage, setWelcomeMessage] = useState(blankAgent.welcomeMessage);
  const [language, setLanguage] = useState(blankAgent.language);
  const [voice, setVoice] = useState(blankAgent.voice);
  const [widgetAccent, setWidgetAccent] = useState("#ff513f");
  const [widgetLabel, setWidgetLabel] = useState("Chat with us");
  const [widgetPosition, setWidgetPosition] = useState<"left" | "right">("right");
  const [widgetTheme, setWidgetTheme] = useState<"light" | "dark">("light");
  const [resources, setResources] = useState<AgentResource[]>([]);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [importingResource, setImportingResource] = useState(false);
  const [draft, setDraft] = useState("What can you help me with?");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const endpoint = agentId ? `/api/agents/${agentId}/chat` : "/api/agents/draft/chat";
  const { messages, listening, speaking, sending, error, ask, startListening } = useOpenCreativeAgent(endpoint, welcomeMessage);

  function selectAgent(agent: SavedAgent) {
    setAgentId(agent.id);
    setName(agent.name);
    setDescription(agent.description || "");
    setKnowledge(agent.knowledge_text);
    setSystemPrompt(agent.system_prompt);
    setWelcomeMessage(agent.welcome_message);
    setLanguage(agent.language);
    setVoice(agent.voice);
    setWidgetAccent(agent.settings?.widget?.accent || "#ff513f");
    setWidgetLabel(agent.settings?.widget?.launcherLabel || "Chat with us");
    setWidgetPosition(agent.settings?.widget?.position || "right");
    setWidgetTheme(agent.settings?.widget?.theme || "light");
    setResources(agent.settings?.resources || []);
    setWebsiteUrl("");
    setNotice("");
  }

  useEffect(() => {
    void fetch("/api/agents")
      .then(async (response) => {
        const result = await response.json() as { agents?: SavedAgent[]; error?: string };
        if (!response.ok) throw new Error(result.error || "Could not load agents.");
        setAgents(result.agents || []);
        if (result.agents?.[0]) selectAgent(result.agents[0]);
      })
      .catch((cause) => setNotice(cause instanceof Error ? cause.message : "Could not load agents."))
      .finally(() => setLoading(false));
  }, []);

  function newAgent() {
    setAgentId("");
    setName(blankAgent.name);
    setDescription(blankAgent.description);
    setKnowledge(blankAgent.knowledge);
    setSystemPrompt(blankAgent.systemPrompt);
    setWelcomeMessage(blankAgent.welcomeMessage);
    setLanguage(blankAgent.language);
    setVoice(blankAgent.voice);
    setWidgetAccent("#ff513f");
    setWidgetLabel("Chat with us");
    setWidgetPosition("right");
    setWidgetTheme("light");
    setResources([]);
    setWebsiteUrl("");
    setNotice("New agent ready to configure.");
  }

  async function saveAgent() {
    setSaving(true);
    setNotice("");
    try {
      const response = await fetch(agentId ? `/api/agents/${agentId}` : "/api/agents", {
        method: agentId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, knowledgeText: knowledge, systemPrompt, welcomeMessage, language, voice, resources, widget: { accent: widgetAccent, launcherLabel: widgetLabel, position: widgetPosition, theme: widgetTheme } }),
      });
      const result = await response.json() as { agent?: SavedAgent; error?: string };
      if (!response.ok || !result.agent) throw new Error(result.error || "Could not save this agent.");
      setAgents((current) => [result.agent!, ...current.filter((agent) => agent.id !== result.agent!.id)]);
      selectAgent(result.agent);
      setNotice(agentId ? "Agent updated." : "Agent created. You can test it now.");
    } catch (cause) {
      setNotice(cause instanceof Error ? cause.message : "Could not save this agent.");
    } finally {
      setSaving(false);
    }
  }

  async function importResource(body: FormData | { url: string }) {
    if (resources.length >= 6) {
      setNotice("You can attach up to 6 knowledge resources to an agent.");
      return;
    }
    setImportingResource(true);
    setNotice("");
    try {
      const response = await fetch("/api/agents/resources", {
        method: "POST",
        headers: body instanceof FormData ? undefined : { "Content-Type": "application/json" },
        body: body instanceof FormData ? body : JSON.stringify(body),
      });
      const result = await response.json() as { resource?: AgentResource; error?: string };
      if (!response.ok || !result.resource) throw new Error(result.error || "Could not import that resource.");
      setResources((current) => [...current, result.resource!]);
      setWebsiteUrl("");
      setNotice(`${result.resource.name} is ready. Save changes to train this agent on it.`);
    } catch (cause) {
      setNotice(cause instanceof Error ? cause.message : "Could not import that resource.");
    } finally {
      setImportingResource(false);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!agentId) {
      setNotice("Save the agent before starting a test conversation.");
      return;
    }
    ask(draft);
    setDraft("");
  }

  const widgetOrigin = process.env.NEXT_PUBLIC_APP_URL || "https://www.opencreativehq.com";
  const escapedWidgetLabel = widgetLabel.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[character] || character);
  const widgetSnippet = agentId
    ? `<script src="${widgetOrigin}/agent-widget.js" data-agent-id="${agentId}" data-position="${widgetPosition}" data-label="${escapedWidgetLabel}" data-color="${widgetAccent}" async></script>`
    : "";

  return (
    <div className="studio-page agent-studio-page">
      <header className="studio-intro"><div><p className="eyebrow"><Bot size={13} /> OpenCreative Agents</p><h1>Build support that listens.</h1><p>Every agent is isolated to this workspace, grounded in its own approved knowledge, and powered by the production voice pipeline.</p></div></header>
      <div className="agent-studio-switcher">
        <label htmlFor="agent-select">Your agents</label>
        <select id="agent-select" value={agentId} onChange={(event) => { const next = agents.find((agent) => agent.id === event.target.value); if (next) selectAgent(next); }} disabled={loading}>
          {!agents.length && <option value="">No saved agents yet</option>}
          {agents.map((agent) => <option value={agent.id} key={agent.id}>{agent.name}</option>)}
        </select>
        <button type="button" onClick={newAgent}><Plus size={16} /> New agent</button>
      </div>
      <div className="studio-layout">
        <section className="studio-controls">
          <div className="control-section"><label className="control-label">Agent name</label><input className="studio-input" value={name} onChange={(event) => setName(event.target.value)} /></div>
          <div className="control-section"><label className="control-label">What this agent does</label><input className="studio-input" value={description} onChange={(event) => setDescription(event.target.value)} /></div>
          <div className="control-section"><label className="control-label">Approved knowledge</label><textarea className="studio-prompt" value={knowledge} onChange={(event) => setKnowledge(event.target.value)} /></div>
          <div className="agent-resource-settings">
            <div><span className="control-label">Knowledge sources</span><small>Crawl up to 8 linked pages from a public website, or attach a text-based PDF. The agent uses only sources you approve.</small></div>
            <div className="agent-resource-import">
              <label><Globe2 size={16} /><input className="studio-input" type="url" placeholder="https://yourwebsite.com/help" value={websiteUrl} onChange={(event) => setWebsiteUrl(event.target.value)} /></label>
              <button type="button" onClick={() => void importResource({ url: websiteUrl })} disabled={importingResource || !websiteUrl.trim()}>Crawl website</button>
            </div>
            <label className="agent-pdf-upload"><Upload size={16} /><span>{importingResource ? "Importing…" : "Attach PDF (up to 8 MB)"}</span><input type="file" accept="application/pdf,.pdf" disabled={importingResource} onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; const form = new FormData(); form.append("file", file); void importResource(form); event.target.value = ""; }} /></label>
            {resources.length > 0 && <div className="agent-resource-list">{resources.map((resource) => <div key={resource.id}><span>{resource.type === "pdf" ? <FileText size={15} /> : <Globe2 size={15} />}<span><strong>{resource.name}</strong><small>{resource.type === "pdf" ? "PDF" : resource.source}</small></span></span><button type="button" aria-label={`Remove ${resource.name}`} onClick={() => setResources((current) => current.filter((item) => item.id !== resource.id))}><Trash2 size={15} /></button></div>)}</div>}
          </div>
          <div className="control-section"><label className="control-label">Behaviour</label><textarea className="studio-prompt agent-system-prompt" value={systemPrompt} onChange={(event) => setSystemPrompt(event.target.value)} /></div>
          <div className="agent-compact-fields"><label><span>Language</span><select value={language} onChange={(event) => setLanguage(event.target.value)}><option value="en">English</option><option value="hi">Hindi</option><option value="es">Spanish</option><option value="fr">French</option><option value="de">German</option><option value="ja">Japanese</option></select></label><label><span>Voice</span><select value={voice} onChange={(event) => setVoice(event.target.value)}><option value="Kore">Kore</option><option value="Aoede">Aoede</option><option value="Orus">Orus</option><option value="Leda">Leda</option><option value="Puck">Puck</option><option value="Charon">Charon</option></select></label></div>
          <div className="agent-widget-settings">
            <div><span className="control-label">Website widget</span><small>Customize the launcher your visitors see.</small></div>
            <label><span>Button label</span><input className="studio-input" maxLength={32} value={widgetLabel} onChange={(event) => setWidgetLabel(event.target.value)} /></label>
            <div className="agent-widget-setting-row">
              <label><span>Brand color</span><input className="agent-color-input" type="color" value={widgetAccent} onChange={(event) => setWidgetAccent(event.target.value)} /></label>
              <label><span>Corner</span><select value={widgetPosition} onChange={(event) => setWidgetPosition(event.target.value as "left" | "right")}><option value="right">Bottom right</option><option value="left">Bottom left</option></select></label>
              <label><span>Theme</span><select value={widgetTheme} onChange={(event) => setWidgetTheme(event.target.value as "light" | "dark")}><option value="light">Light</option><option value="dark">Dark</option></select></label>
            </div>
            {agentId ? <div className="agent-widget-snippet"><code>{widgetSnippet}</code><CopyButton value={widgetSnippet} label="Copy install snippet" /></div> : <small>Save this agent to get its one-line website snippet.</small>}
          </div>
          <button className="generate-button" type="button" onClick={saveAgent} disabled={saving || knowledge.trim().length < 20}>{saving ? <LoaderCircle className="spin" size={17} /> : <Save size={17} />} {agentId ? "Save changes" : "Create agent"}</button>
          {notice && <p className="studio-inline-notice">{notice}</p>}
        </section>
        <section className="studio-result-panel agent-studio-preview"><header><span><Bot size={18} /> {name}</span><small>{speaking ? "SPEAKING" : listening ? "LISTENING" : sending ? "THINKING" : "VOICE + TEXT"}</small></header><div>{messages.slice(-8).map((message, index) => <p className={message.role} key={`${message.text}-${index}`}>{message.text}</p>)}</div>{error && <small className="studio-agent-error">{error}</small>}<form onSubmit={submit}><button type="button" className={listening ? "active" : ""} onClick={startListening} disabled={!agentId || sending} aria-label="Talk to this agent"><Mic size={17} /></button><input value={draft} onChange={(event) => setDraft(event.target.value)} aria-label="Test question" disabled={!agentId || sending} /><button type="submit" disabled={!agentId || sending} aria-label="Send test question"><Send size={17} /></button></form></section>
      </div>
    </div>
  );
}
