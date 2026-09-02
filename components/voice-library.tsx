"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Mic2, Pause, Play, Search, Sparkles } from "lucide-react";

const voices = [
  [
    "Maya",
    "Warm · Assured",
    "English, Hindi",
    "#ef664f",
    "Advertisement",
    "/audio/maya.wav",
  ],
  [
    "Theo",
    "Natural · Bright",
    "English",
    "#d4a63e",
    "Conversational",
    "/audio/theo.wav",
  ],
  [
    "Sora",
    "Calm · Refined",
    "Multilingual",
    "#718e99",
    "Narration",
    "/audio/sora.wav",
  ],
  [
    "Arlo",
    "Deep · Cinematic",
    "English",
    "#5a514d",
    "Trailer",
    "/audio/arlo.wav",
  ],
  ["Nia", "Energetic · Clear", "Multilingual", "#8d719f", "UGC", "/audio/nia.wav"],
  ["Dev", "Professional · Warm", "English, Hindi", "#6e8948", "Explainer", "/audio/dev.wav"],
  [
    "Lucia",
    "Expressive · Elegant",
    "Spanish, English",
    "#b96c60",
    "Podcast",
    "/audio/lucia.wav",
  ],
  [
    "Kenji",
    "Clear · Measured",
    "Japanese, English",
    "#657696",
    "Professional",
    "/audio/kenji.wav",
  ],
  ["Amina", "Warm · Grounded", "Arabic, English", "#8d6d52", "Narration", "/audio/amina.wav"],
  [
    "Camille",
    "Polished · Intimate",
    "French, English",
    "#806e93",
    "Luxury",
    "/audio/camille.wav",
  ],
  ["Mateo", "Friendly · Upbeat", "Spanish, English", "#4f8691", "UGC", "/audio/mateo.wav"],
  ["Priya", "Bright · Precise", "Hindi, English", "#a96872", "Learning", "/audio/priya.wav"],
  [
    "Jonas",
    "Confident · Direct",
    "German, English",
    "#596b89",
    "Corporate",
    "/audio/jonas.wav",
  ],
  ["Zuri", "Energetic · Magnetic", "English, Swahili", "#a25c48", "Social", "/audio/zuri.wav"],
  [
    "Ana",
    "Natural · Optimistic",
    "Portuguese, English",
    "#638562",
    "Lifestyle",
    "/audio/ana.wav",
  ],
  ["Eli", "Youthful · Breezy", "English", "#5b85a2", "Conversational", "/audio/eli.wav"],
] as const;

export function VoiceLibrary() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [playing, setPlaying] = useState("");
  const audio = useRef<HTMLAudioElement | null>(null);
  const filters = [
    "All",
    ...Array.from(new Set(voices.map((voice) => voice[4]))),
  ];
  const visible = useMemo(
    () =>
      voices.filter(
        (voice) =>
          (filter === "All" || voice[4] === filter) &&
          `${voice[0]} ${voice[1]} ${voice[2]} ${voice[4]}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [filter, query],
  );
  function preview(name: string, sample: string) {
    if (playing === name) {
      audio.current?.pause();
      setPlaying("");
      return;
    }
    audio.current?.pause();
    audio.current = new Audio(sample);
    audio.current.onended = () => setPlaying("");
    audio.current.play();
    setPlaying(name);
  }
  return (
    <div className="voice-library-page">
      <header className="library-head">
        <div>
          <p className="eyebrow">
            <Mic2 size={13} />
            Voices
          </p>
          <h1>A voice for every idea.</h1>
          <p>
            Search by character, language or use case. Preview the samples, then
            generate your own words in the audio studio.
          </p>
        </div>
        <Link className="button button-dark" href="/studio/audio">
          Open audio studio <ArrowRight size={15} />
        </Link>
      </header>
      <div className="voice-filterbar">
        <label>
          <Search size={15} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search voices, styles, languages…"
          />
        </label>
        {filters.map((item) => (
          <button
            className={filter === item ? "active" : ""}
            onClick={() => setFilter(item)}
            key={item}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="voice-library-grid">
        {visible.map(([name, style, languages, color, useCase, sample]) => (
          <article key={name}>
            <button
                className="voice-play"
                style={{ background: color }}
                onClick={() => preview(name, sample)}
                aria-label={`${playing === name ? "Pause" : "Play"} ${name} preview`}
              >
                {playing === name ? <Pause size={18} /> : <Play size={18} />}
              </button>
            <div className="voice-wave">
              {Array.from({ length: 34 }, (_, index) => (
                <i
                  key={index}
                  style={{ height: `${8 + ((index * 13) % 28)}px` }}
                />
              ))}
            </div>
            <span>{useCase}</span>
            <h2>{name}</h2>
            <p>{style}</p>
            <small>{languages}</small>
            <Link href={`/studio/audio?voice=${name.toLowerCase()}`}>
              Use voice <Sparkles size={13} />
            </Link>
          </article>
        ))}
      </div>
      {!visible.length && (
        <div className="library-empty">
          <h2>No voices match that search.</h2>
          <p>Try a language, tone or broader use case.</p>
        </div>
      )}
    </div>
  );
}
