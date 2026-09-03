"use client";

import { useRef, useState } from "react";
import { Download, LoaderCircle, Music2, Sparkles } from "lucide-react";

type MusicResult = {
  url?: string;
  credits?: number;
  model?: { id: string; displayName: string };
  error?: string;
};

export function MusicStudio() {
  const [brief, setBrief] = useState("Nocturnal electronic pulse with warm analog bass, natural field ambience, and a hopeful lift");
  const [mood, setMood] = useState("Cinematic");
  const [quality, setQuality] = useState<"standard" | "premium">("standard");
  const [instrumental, setInstrumental] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<MusicResult | null>(null);
  const requestId = useRef("");

  async function createTrack() {
    setGenerating(true);
    setResult(null);
    requestId.current = crypto.randomUUID();
    try {
      const response = await fetch("/api/generate/music", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: brief, mood, quality, instrumental, idempotencyKey: requestId.current }),
      });
      const next = await response.json() as MusicResult;
      if (!response.ok) throw new Error(next.error || "Music generation failed.");
      setResult(next);
    } catch (cause) {
      setResult({ error: cause instanceof Error ? cause.message : "Music generation failed. Your reserved credits were returned." });
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="studio-page music-studio-page">
      <header className="studio-intro"><div><p className="eyebrow"><Music2 size={13} /> Music AI</p><h1>Give the idea a pulse.</h1><p>Generate a real, playable campaign track through OpenRouter and keep it in your private asset library.</p></div></header>
      <div className="studio-layout">
        <section className="studio-controls">
          <div className="control-section"><label className="control-label">Describe the track</label><textarea className="studio-prompt" value={brief} onChange={(event) => setBrief(event.target.value)} /></div>
          <div className="control-section"><label className="control-label">Direction</label><div className="segmented">{["Cinematic", "Editorial", "Energetic", "Minimal"].map((item) => <button type="button" className={mood === item ? "active" : ""} onClick={() => setMood(item)} key={item}>{item}</button>)}</div></div>
          <div className="control-section"><label className="control-label">Length and finish</label><div className="segmented"><button type="button" className={quality === "standard" ? "active" : ""} onClick={() => setQuality("standard")}>30-second clip · 8 credits</button><button type="button" className={quality === "premium" ? "active" : ""} onClick={() => setQuality("premium")}>Full track · 14 credits</button></div></div>
          <label className="music-instrumental-toggle"><input type="checkbox" checked={instrumental} onChange={(event) => setInstrumental(event.target.checked)} /><span>Instrumental only</span></label>
          <button className="generate-button" type="button" disabled={brief.trim().length < 10 || generating} onClick={createTrack}>{generating ? <LoaderCircle className="spin" size={17} /> : <Sparkles size={17} />} {generating ? "Generating with OpenRouter" : "Generate original track"}</button>
        </section>
        <section className="studio-result-panel music-studio-result">
          <div><span>OPENROUTER MUSIC GENERATION</span><strong>{result?.url ? `${mood} Signal` : generating ? "Composing your track" : "Ready for a brief"}</strong><p>{result?.url ? brief : generating ? "Lyria is arranging and mixing the result. This can take about a minute." : "The exact credit cost is reserved before the provider request and returned if it fails."}</p></div>
          {result?.url && <div className="generated-music-player"><Music2 size={34} /><audio src={result.url} controls autoPlay /><div><span>{result.model?.displayName}</span><small>{result.credits} credits · saved privately</small></div><a href={result.url} download><Download size={16} /> Download WAV</a></div>}
          {result?.error && <div className="music-generation-error"><strong>Track not generated</strong><p>{result.error}</p><small>No local rendering was used. Any reserved credits were returned.</small></div>}
          {!result && !generating && <div className="music-provider-ready"><div className="music-provider-wave" aria-hidden="true">{Array.from({ length: 36 }, (_, index) => <i key={index} />)}</div><span>Google Lyria 3 via OpenRouter</span><small>48 kHz stereo output · private R2 delivery · no local FFmpeg</small></div>}
        </section>
      </div>
    </div>
  );
}
