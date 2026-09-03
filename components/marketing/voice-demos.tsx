"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, Volume2 } from "lucide-react";

const languages = ["All", "English", "Hindi", "Spanish", "French", "Japanese"] as const;
const demos = [
  { name: "Maya", trait: "Warm · Assured", gender: "Female", accent: "Indian English", use: "Brand films", language: "English", lang: "en-IN", color: "#ff513f", audio: "/audio/maya.wav", sample: "Build the campaign around the feeling, then let every format carry it forward." },
  { name: "Theo", trait: "Bright · Conversational", gender: "Male", accent: "US English", use: "Product stories", language: "English", lang: "en-US", color: "#f1a72d", audio: "/audio/theo.wav", sample: "Start with the product truth, find the human hook, and make every second earn attention." },
  { name: "Ellis", trait: "Measured · Cinematic", gender: "Male", accent: "British English", use: "Launch films", language: "English", lang: "en-GB", color: "#b17845", audio: "/audio/ellis.wav", sample: "A memorable launch does not shout. It gives the audience a reason to lean closer." },
  { name: "Clara", trait: "Editorial · Poised", gender: "Female", accent: "British English", use: "Editorial", language: "English", lang: "en-GB", color: "#d06b83", audio: "/audio/clara.wav", sample: "Shape the idea once, then let it travel beautifully across every screen." },
  { name: "Priya", trait: "Expressive · Assured", gender: "Female", accent: "Indian Hindi", use: "Social stories", language: "Hindi", lang: "hi-IN", color: "#ea9831", audio: "/audio/priya.wav", sample: "एक विचार से पूरी कहानी बनाइए, अपनी भाषा और अपनी आवाज़ में।" },
  { name: "Dev", trait: "Grounded · Clear", gender: "Male", accent: "Indian Hindi", use: "Explainers", language: "Hindi", lang: "hi-IN", color: "#78883f", audio: "/audio/dev.wav", sample: "सही संदेश को सही आवाज़ दीजिए, और हर ग्राहक तक भरोसे के साथ पहुँचिए।" },
  { name: "Lucia", trait: "Elegant · Expressive", gender: "Female", accent: "European Spanish", use: "Luxury", language: "Spanish", lang: "es-ES", color: "#ca675c", audio: "/audio/lucia.wav", sample: "Convierte una idea valiente en una campaña que la gente quiera recordar." },
  { name: "Mateo", trait: "Friendly · Upbeat", gender: "Male", accent: "Latin American Spanish", use: "Product stories", language: "Spanish", lang: "es-MX", color: "#13a46b", audio: "/audio/mateo.wav", sample: "Tu producto ya tiene una historia; ahora vamos a darle ritmo, imagen y una voz propia." },
  { name: "Camille", trait: "Polished · Calm", gender: "Female", accent: "Metropolitan French", use: "Luxury campaigns", language: "French", lang: "fr-FR", color: "#e56d91", audio: "/audio/camille.wav", sample: "Une seule idée peut devenir un univers cohérent, élégant et immédiatement reconnaissable." },
  { name: "Luc", trait: "Direct · Confident", gender: "Male", accent: "Metropolitan French", use: "Explainers", language: "French", lang: "fr-FR", color: "#6f6b9b", audio: "/audio/luc.wav", sample: "Donnez une direction claire à la création, puis laissez chaque format amplifier le message." },
  { name: "Sora", trait: "Soft · Composed", gender: "Female", accent: "Japanese", use: "Narration", language: "Japanese", lang: "ja-JP", color: "#7b8fa3", audio: "/audio/sora.wav", sample: "ひとつのアイデアから、映像も音声も、心に残るひとつの世界へ。" },
  { name: "Kenji", trait: "Focused · Modern", gender: "Male", accent: "Japanese", use: "Technology", language: "Japanese", lang: "ja-JP", color: "#4388ff", audio: "/audio/kenji.wav", sample: "商品の魅力をまっすぐ伝え、見る人の次の行動につなげます。" },
] as const;

export function VoiceDemos() {
  const [playing, setPlaying] = useState<number | null>(null);
  const [language, setLanguage] = useState<(typeof languages)[number]>("All");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const visible = useMemo(() => demos.filter((voice) => language === "All" || voice.language === language), [language]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  function toggle(index: number) {
    if (playing === index) {
      audioRef.current?.pause();
      audioRef.current = null;
      setPlaying(null);
      return;
    }
    const demo = demos[index];
    audioRef.current?.pause();
    const audio = new Audio(demo.audio);
    audioRef.current = audio;
    audio.onended = () => setPlaying(null);
    audio.onerror = () => setPlaying(null);
    setPlaying(index);
    audio.play().catch(() => setPlaying(null));
  }

  return (
    <div className="voice-experience-2026">
      <div className="voice-language-tabs" role="tablist" aria-label="Voice languages">
        {languages.map((item) => <button type="button" role="tab" aria-selected={language === item} className={language === item ? "active" : ""} onClick={() => { audioRef.current?.pause(); audioRef.current = null; setPlaying(null); setLanguage(item); }} key={item}>{item}</button>)}
      </div>
      <div className="voice-demo-grid voice-demo-grid-2026">
        {visible.map((voice) => {
          const index = demos.indexOf(voice);
          return (
            <article key={voice.name} className={playing === index ? "is-playing" : ""}>
              <header><span className="voice-demo-avatar" style={{ background: voice.color }}>{voice.name[0]}</span><div><strong>{voice.name}</strong><small>{voice.trait}</small></div><button type="button" onClick={() => toggle(index)} aria-label={`${playing === index ? "Stop" : "Play"} ${voice.name} in ${voice.language}`}>{playing === index ? <Pause size={17} /> : <Play size={17} />}</button></header>
              <blockquote lang={voice.lang}>{voice.sample}</blockquote>
              <div className="voice-demo-wave" aria-hidden="true">{Array.from({ length: 52 }, (_, bar) => <i key={bar} style={{ height: `${8 + ((bar * (index + 7)) % 32)}px` }} />)}</div>
              <footer><span><Volume2 size={13} />{voice.use}</span><small>{voice.gender} · {voice.accent}</small></footer>
            </article>
          );
        })}
      </div>
    </div>
  );
}
