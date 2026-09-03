"use client";

import { useEffect, useRef, useState } from "react";
import {
  AudioWaveform,
  Check,
  FileAudio,
  Languages,
  LoaderCircle,
  Mic2,
  Pause,
  Play,
  Sparkles,
  Upload,
} from "lucide-react";

const voices = [
  {
    id: "Leda",
    sample: "/audio/maya.wav",
    name: "Maya",
    language: "English",
    gender: "Female",
    style: "Warm, assured",
    use: "Advertisement",
    accent: "Indian English",
    color: "#ef664f",
  },
  {
    id: "Puck",
    sample: "/audio/theo.wav",
    name: "Theo",
    language: "English",
    gender: "Male",
    style: "Natural, bright",
    use: "Conversational",
    accent: "US English",
    color: "#d4a63e",
  },
  {
    id: "Algieba",
    sample: "/audio/ellis.wav",
    name: "Ellis",
    language: "English",
    gender: "Male",
    style: "Measured, cinematic",
    use: "Trailer",
    accent: "British English",
    color: "#718e99",
  },
  {
    id: "Aoede",
    sample: "/audio/clara.wav",
    name: "Clara",
    language: "English",
    gender: "Female",
    style: "Polished, intimate",
    use: "Narration",
    accent: "British English",
    color: "#5a514d",
  },
  {
    id: "Kore",
    sample: "/audio/priya.wav",
    name: "Priya",
    language: "Hindi",
    gender: "Female",
    style: "Bright, precise",
    use: "Learning",
    accent: "Indian",
    color: "#8d719f",
  },
  {
    id: "Orus",
    sample: "/audio/dev.wav",
    name: "Dev",
    language: "Hindi",
    gender: "Male",
    style: "Professional",
    use: "Explainer",
    accent: "Indian",
    color: "#6e8948",
  },
  {
    id: "Callirrhoe",
    sample: "/audio/lucia.wav",
    name: "Lucia",
    language: "Spanish",
    gender: "Female",
    style: "Expressive, elegant",
    use: "Podcast",
    accent: "Iberian",
    color: "#b96c60",
  },
  {
    id: "Enceladus",
    sample: "/audio/mateo.wav",
    name: "Mateo",
    language: "Spanish",
    gender: "Male",
    style: "Friendly, upbeat",
    use: "UGC",
    accent: "Latin American",
    color: "#4f8691",
  },
  {
    id: "Despina",
    sample: "/audio/camille.wav",
    name: "Camille",
    language: "French",
    gender: "Female",
    style: "Polished, intimate",
    use: "Luxury",
    accent: "Metropolitan French",
    color: "#806e93",
  },
  {
    id: "Alnilam",
    sample: "/audio/luc.wav",
    name: "Luc",
    language: "French",
    gender: "Male",
    style: "Confident, direct",
    use: "Corporate",
    accent: "Metropolitan French",
    color: "#596b89",
  },
  {
    id: "Achernar",
    sample: "/audio/sora.wav",
    name: "Sora",
    language: "Japanese",
    gender: "Female",
    style: "Calm, refined",
    use: "Narration",
    accent: "Japanese",
    color: "#638562",
  },
  {
    id: "Fenrir",
    sample: "/audio/kenji.wav",
    name: "Kenji",
    language: "Japanese",
    gender: "Male",
    style: "Clear, measured",
    use: "Professional",
    accent: "Japanese",
    color: "#657696",
  },
];
type Tab = "tts" | "stt" | "dub";

export function AudioStudio() {
  const [tab, setTab] = useState<Tab>("tts");
  const [voice, setVoice] = useState(voices[0]);
  const [text, setText] = useState(
    "Create without limits. OpenCreative turns your idea into finished creative.",
  );
  const [speed, setSpeed] = useState(1);
  const [language, setLanguage] = useState("English");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [translated, setTranslated] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [useCase, setUseCase] = useState("All use cases");
  const visibleVoices =
    useCase === "All use cases"
      ? voices
      : voices.filter((item) => item.use === useCase);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const requested = new URLSearchParams(window.location.search).get(
        "voice",
      );
      const requestedMode = new URLSearchParams(window.location.search).get(
        "mode",
      );
      if (requestedMode === "dub") setTab("dub");
      const selected = voices.find(
        (item) => item.name.toLowerCase() === requested,
      );
      if (selected) setVoice(selected);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  function preview(selectedVoice = voice) {
    setVoice(selectedVoice);
    setError("");
    setAudioUrl(selectedVoice.sample);
    window.setTimeout(() => audioRef.current?.play(), 50);
  }

  async function speak(sample = false, selectedVoice = voice) {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/generate/speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: sample
            ? `Hi, I’m ${selectedVoice.name}. Your next idea deserves a voice.`
            : text,
          voice: selectedVoice.id,
          speed,
          quality: "standard",
          idempotencyKey: crypto.randomUUID(),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setAudioUrl(data.url);
      setTimeout(() => audioRef.current?.play(), 50);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not generate speech.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function fileBase64() {
    if (!file) throw new Error("Choose an audio or video file first.");
    if (file.size > 25 * 1024 * 1024)
      throw new Error("Keep files under 25 MB for browser transcription.");
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(",")[1]);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
    const ext = (file.name.split(".").pop() || "mp3").toLowerCase();
    return {
      base64,
      format: ["wav", "mp3", "flac", "m4a", "ogg", "webm", "aac", "mp4", "mov"].includes(ext)
        ? ext
        : "mp3",
    };
  }

  async function transcribe() {
    setLoading(true);
    setError("");
    try {
      const media = await fileBase64();
      const response = await fetch("/api/generate/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...media,
          quality: "standard",
          idempotencyKey: crypto.randomUUID(),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setTranscript(data.transcript);
      if (tab === "dub") {
        const translatedResponse = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: data.transcript,
            language,
            tone: "natural spoken dialogue",
          }),
        });
        const translatedData = await translatedResponse.json();
        if (!translatedResponse.ok) throw new Error(translatedData.error);
        setTranslated(translatedData.translation);
        setText(translatedData.translation);
      }
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not transcribe this file.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="audio-page">
      <header className="studio-intro">
        <div>
          <p className="eyebrow">
            <AudioWaveform size={13} />
            Audio studio
          </p>
          <h1>
            Find the right voice.
            <br />
            In any language.
          </h1>
          <p>
            Expressive speech in 80+ languages, transcription, and video dubbing
            routed through the right model. Provider details stay out of your way.
          </p>
        </div>
      </header>
      <div className="audio-tabs">
        {(
          [
            ["tts", "Text to speech", Mic2],
            ["stt", "Speech to text", FileAudio],
            ["dub", "Dub / translate", Languages],
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            className={tab === id ? "active" : ""}
            onClick={() => setTab(id)}
          >
            <Icon size={17} />
            {label}
          </button>
        ))}
      </div>
      {tab === "tts" && (
        <div className="audio-layout">
          <section className="voice-browser">
            <div className="section-head">
              <div>
                <h2>Choose a voice</h2>
                <p>Friendly names. Provider-aware routing underneath.</p>
              </div>
              <select
                aria-label="Voice use case"
                value={useCase}
                onChange={(event) => setUseCase(event.target.value)}
              >
                <option>All use cases</option>
                {Array.from(new Set(voices.map((item) => item.use))).map(
                  (item) => (
                    <option key={item}>{item}</option>
                  ),
                )}
              </select>
            </div>
            <div className="voice-grid">
              {visibleVoices.map((item) => (
                <button
                  className={voice.id === item.id ? "selected" : ""}
                  onClick={() => setVoice(item)}
                  key={item.id}
                >
                  <span
                    className="voice-avatar"
                    style={{ background: item.color }}
                  >
                    {item.name[0]}
                  </span>
                  <span>
                    <strong>{item.name}</strong>
                    <small>{item.language} · {item.gender}</small>
                  </span>
                  <i
                    onClick={(event) => {
                      event.stopPropagation();
                      setVoice(item);
                      preview(item);
                    }}
                  >
                    <Play size={14} />
                  </i>
                  <p>{item.style}</p>
                  <em>{item.use}</em>
                  {voice.id === item.id && (
                    <b>
                      <Check size={12} />
                    </b>
                  )}
                </button>
              ))}
            </div>
          </section>
          <section className="speech-composer">
            <p className="eyebrow">Voiceover</p>
            <div className="selected-voice">
              <span
                className="voice-avatar"
                style={{ background: voice.color }}
              >
                {voice.name[0]}
              </span>
              <div>
                <strong>{voice.name}</strong>
                <small>
                  {voice.style} · {voice.accent}
                </small>
              </div>
            </div>
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              maxLength={10000}
            />
            <div className="speech-meta">
              <span>{text.length} characters</span>
              <label>
                Speed{" "}
                <input
                  type="range"
                  min=".7"
                  max="1.3"
                  step=".05"
                  value={speed}
                  onChange={(event) => setSpeed(Number(event.target.value))}
                />
                <strong>{speed.toFixed(2)}×</strong>
              </label>
            </div>
            {error && <p className="form-error">{error}</p>}
            <button
              className="generate-button"
              disabled={loading || !text.trim()}
              onClick={() => speak()}
            >
              {loading ? (
                <LoaderCircle className="spin" size={18} />
              ) : (
                <Sparkles size={18} />
              )}
              Generate speech
            </button>
            {audioUrl && (
              <div className="audio-player">
                <button
                  onClick={() => {
                    if (audioRef.current?.paused) audioRef.current.play();
                    else audioRef.current?.pause();
                  }}
                >
                  {playing ? <Pause size={16} /> : <Play size={16} />}
                </button>
                <div className="wave-bars">
                  {Array.from({ length: 28 }, (_, index) => (
                    <i
                      key={index}
                      style={{ height: `${12 + ((index * 17) % 24)}px` }}
                    />
                  ))}
                </div>
                <a href={audioUrl} download>
                  Download
                </a>
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onPlay={() => setPlaying(true)}
                  onPause={() => setPlaying(false)}
                />
              </div>
            )}
          </section>
        </div>
      )}
      {(tab === "stt" || tab === "dub") && (
        <section className="transcribe-panel">
          <div className="transcribe-copy">
            <p className="eyebrow">
              {tab === "dub" ? "Dubbing workflow" : "Transcription"}
            </p>
            <h2>
              {tab === "dub"
                ? "Translate a voice, not its meaning."
                : "Turn recordings into useful text."}
            </h2>
            <p>
              {tab === "dub"
                ? "Upload, transcribe, translate, then generate replacement speech. Composition stays a separate export step so you remain in control."
                : "Upload audio or video and receive a clean transcript. Supported formats include MP3, WAV, M4A, MP4, MOV, OGG, WebM and AAC."}
            </p>
            {tab === "dub" && (
              <label className="form-field">
                Target language
                <select
                  value={language}
                  onChange={(event) => setLanguage(event.target.value)}
                >
                  <option>English</option>
                  <option>Hindi</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                  <option>Japanese</option>
                  <option>Korean</option>
                  <option>Portuguese</option>
                </select>
              </label>
            )}
          </div>
          <label className="audio-drop">
            <Upload size={25} />
            <strong>{file ? file.name : "Drop audio or video here"}</strong>
            <small>
              {file
                ? `${(file.size / 1024 / 1024).toFixed(1)} MB`
                : "or click to choose · max 25 MB"}
            </small>
            <input
              type="file"
              accept="audio/*,video/mp4,video/webm"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button
            className="generate-button"
            disabled={!file || loading}
            onClick={transcribe}
          >
            {loading ? (
              <LoaderCircle className="spin" size={18} />
            ) : (
              <Sparkles size={18} />
            )}
            {tab === "dub" ? "Transcribe & translate" : "Transcribe"}
          </button>
          {transcript && (
            <div className="transcript-result">
              <span>Transcript</span>
              <p>{transcript}</p>
              {translated && (
                <>
                  <span>{language} translation</span>
                  <p>{translated}</p>
                  <button
                    className="button button-dark"
                    onClick={() => setTab("tts")}
                  >
                    Continue with replacement voice <Play size={15} />
                  </button>
                </>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
