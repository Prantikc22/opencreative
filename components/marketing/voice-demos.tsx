"use client";

import { useEffect, useMemo, useState } from "react";
import { Pause, Play, Volume2 } from "lucide-react";

const languages = ["All", "English", "Hindi", "Spanish", "French", "Japanese"] as const;
const demos = [
  { name: "Maya", trait: "Warm · Assured", use: "Brand films", language: "English", lang: "en-US", color: "#ff513f", sample: "Build the campaign around the feeling, then let every format carry it forward." },
  { name: "Priya", trait: "Clear · Expressive", use: "Social stories", language: "Hindi", lang: "hi-IN", color: "#f1a72d", sample: "एक विचार से पूरी कहानी बनाइए, अपनी भाषा और अपनी आवाज़ में।" },
  { name: "Mateo", trait: "Natural · Bright", use: "Product explainers", language: "Spanish", lang: "es-ES", color: "#13a46b", sample: "Convierte una sola idea en una campaña completa, lista para compartir." },
  { name: "Camille", trait: "Editorial · Calm", use: "Luxury campaigns", language: "French", lang: "fr-FR", color: "#e56d91", sample: "Une seule idée devient un univers créatif cohérent, dans chaque format." },
  { name: "Kenji", trait: "Focused · Modern", use: "Technology", language: "Japanese", lang: "ja-JP", color: "#4388ff", sample: "ひとつのアイデアから、映像、音声、音楽まで一つの世界を作ります。" },
  { name: "Arlo", trait: "Deep · Cinematic", use: "Launch films", language: "English", lang: "en-GB", color: "#b17845", sample: "The best launch does not explain the idea. It lets the audience feel it." },
] as const;

export function VoiceDemos() {
  const [playing, setPlaying] = useState<number | null>(null);
  const [language, setLanguage] = useState<(typeof languages)[number]>("All");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const visible = useMemo(() => demos.filter((voice) => language === "All" || voice.language === language), [language]);

  useEffect(() => {
    const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => {
      window.speechSynthesis.cancel();
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
    };
  }, []);

  function toggle(index: number) {
    if (playing === index) {
      window.speechSynthesis.cancel();
      setPlaying(null);
      return;
    }
    const demo = demos[index];
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(demo.sample);
    utterance.lang = demo.lang;
    utterance.rate = demo.language === "Japanese" ? 0.93 : 0.98;
    utterance.pitch = demo.name === "Arlo" ? 0.82 : demo.name === "Priya" ? 1.08 : 1;
    const matches = voices.filter((voice) => voice.lang.toLowerCase().startsWith(demo.lang.slice(0, 2).toLowerCase()));
    utterance.voice = matches[index % Math.max(matches.length, 1)] ?? null;
    utterance.onend = () => setPlaying(null);
    utterance.onerror = () => setPlaying(null);
    setPlaying(index);
    window.speechSynthesis.speak(utterance);
  }

  return (
    <div className="voice-experience-2026">
      <div className="voice-language-tabs" role="tablist" aria-label="Voice languages">
        {languages.map((item) => <button type="button" role="tab" aria-selected={language === item} className={language === item ? "active" : ""} onClick={() => { window.speechSynthesis.cancel(); setPlaying(null); setLanguage(item); }} key={item}>{item}</button>)}
      </div>
      <div className="voice-demo-grid voice-demo-grid-2026">
        {visible.map((voice) => {
          const index = demos.indexOf(voice);
          return (
            <article key={voice.name} className={playing === index ? "is-playing" : ""}>
              <header><span className="voice-demo-avatar" style={{ background: voice.color }}>{voice.name[0]}</span><div><strong>{voice.name}</strong><small>{voice.trait}</small></div><button type="button" onClick={() => toggle(index)} aria-label={`${playing === index ? "Stop" : "Play"} ${voice.name} in ${voice.language}`}>{playing === index ? <Pause size={17} /> : <Play size={17} />}</button></header>
              <blockquote lang={voice.lang}>{voice.sample}</blockquote>
              <div className="voice-demo-wave" aria-hidden="true">{Array.from({ length: 52 }, (_, bar) => <i key={bar} style={{ height: `${8 + ((bar * (index + 7)) % 32)}px` }} />)}</div>
              <footer><span><Volume2 size={13} />{voice.use}</span><small>{voice.language} · {voice.lang}</small></footer>
            </article>
          );
        })}
      </div>
    </div>
  );
}
