"use client";

import { useState } from "react";
import { Music2 } from "lucide-react";

export function MusicStudio() {
  const [brief, setBrief] = useState("Nocturnal electronic pulse with warm analog bass, natural field ambience, and a hopeful lift");
  const [mood, setMood] = useState("Cinematic");
  const [quality, setQuality] = useState<"standard" | "premium">("standard");
  const [instrumental, setInstrumental] = useState(true);
  return (
    <div className="studio-page music-studio-page">
      <header className="studio-intro"><div><p className="eyebrow"><Music2 size={13} /> Music AI · Beta</p><h1>Give the idea a pulse.</h1><p>Music generation is in beta. OpenRouter provider access is temporarily paused while we harden reliable delivery.</p></div></header>
      <div className="studio-layout">
        <section className="studio-controls">
          <div className="control-section"><label className="control-label">Describe the track</label><textarea className="studio-prompt" value={brief} onChange={(event) => setBrief(event.target.value)} /></div>
          <div className="control-section"><label className="control-label">Direction</label><div className="segmented">{["Cinematic", "Editorial", "Energetic", "Minimal"].map((item) => <button type="button" className={mood === item ? "active" : ""} onClick={() => setMood(item)} key={item}>{item}</button>)}</div></div>
          <div className="control-section"><label className="control-label">Length and finish</label><div className="segmented"><button type="button" className={quality === "standard" ? "active" : ""} onClick={() => setQuality("standard")}>30-second clip · 8 credits</button><button type="button" className={quality === "premium" ? "active" : ""} onClick={() => setQuality("premium")}>Full track · 14 credits</button></div></div>
          <label className="music-instrumental-toggle"><input type="checkbox" checked={instrumental} onChange={(event) => setInstrumental(event.target.checked)} /><span>Instrumental only</span></label>
          <button className="generate-button" type="button" disabled>Provider generation temporarily paused</button>
        </section>
        <section className="studio-result-panel music-studio-result">
          <div><span>BETA STATUS</span><strong>Brief builder is ready</strong><p>Your direction can be prepared here, but no credits are reserved until the provider route is restored.</p></div>
          <div className="music-provider-ready"><div className="music-provider-wave" aria-hidden="true">{Array.from({ length: 36 }, (_, index) => <i key={index} />)}</div><span>Provider connection paused</span><small>Generation will return after reliable OpenRouter music capacity is available.</small></div>
        </section>
      </div>
    </div>
  );
}
