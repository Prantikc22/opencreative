"use client";

import { useRef, useState } from "react";
import { Pause, Play, Volume2 } from "lucide-react";

const demos = [
  {
    name: "Maya",
    trait: "Warm · Assured",
    use: "Brand films",
    language: "English · Hindi",
    color: "#ef664f",
    src: "/audio/maya.wav",
  },
  {
    name: "Theo",
    trait: "Natural · Bright",
    use: "Product explainers",
    language: "English",
    color: "#d4a63e",
    src: "/audio/theo.wav",
  },
  {
    name: "Sora",
    trait: "Calm · Refined",
    use: "Narration",
    language: "Multilingual",
    color: "#718e99",
    src: "/audio/sora.wav",
  },
  {
    name: "Arlo",
    trait: "Deep · Cinematic",
    use: "Launch films",
    language: "English",
    color: "#8d719f",
    src: "/audio/arlo.wav",
  },
];

export function VoiceDemos() {
  const refs = useRef<Array<HTMLAudioElement | null>>([]);
  const [playing, setPlaying] = useState<number | null>(null);

  function toggle(index: number) {
    refs.current.forEach((audio, itemIndex) => {
      if (audio && itemIndex !== index) audio.pause();
    });
    const audio = refs.current[index];
    if (!audio) return;
    if (audio.paused) void audio.play();
    else audio.pause();
  }

  return (
    <div className="voice-demo-grid">
      {demos.map((voice, index) => (
        <article
          key={voice.name}
          className={playing === index ? "is-playing" : ""}
        >
          <header>
            <span
              className="voice-demo-avatar"
              style={{ background: voice.color }}
            >
              {voice.name[0]}
            </span>
            <div>
              <strong>{voice.name}</strong>
              <small>{voice.trait}</small>
            </div>
            <button
              onClick={() => toggle(index)}
              aria-label={`${playing === index ? "Pause" : "Play"} ${voice.name} voice sample`}
            >
              {playing === index ? <Pause size={17} /> : <Play size={17} />}
            </button>
          </header>
          <div className="voice-demo-wave" aria-hidden="true">
            {Array.from({ length: 40 }, (_, bar) => (
              <i
                key={bar}
                style={{ height: `${8 + ((bar * (index + 7)) % 28)}px` }}
              />
            ))}
          </div>
          <footer>
            <span>
              <Volume2 size={13} />
              {voice.use}
            </span>
            <small>{voice.language}</small>
          </footer>
          <audio
            ref={(element) => {
              refs.current[index] = element;
            }}
            src={voice.src}
            preload="metadata"
            onPlay={() => setPlaying(index)}
            onPause={() =>
              setPlaying((current) => (current === index ? null : current))
            }
            onEnded={() => setPlaying(null)}
          />
        </article>
      ))}
    </div>
  );
}
