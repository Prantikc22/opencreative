"use client";

import { useEffect, useRef, useState } from "react";
import { Music2, Pause, Play } from "lucide-react";

const notes = [110, 130.81, 164.81, 196, 146.83, 174.61, 220, 261.63];

export function MusicDemo() {
  const audioContext = useRef<AudioContext | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const beat = useRef(0);
  const [playing, setPlaying] = useState(false);

  function scheduleNote(context: AudioContext, index: number) {
    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = index % 4 === 0 ? "triangle" : "sine";
    oscillator.frequency.value = notes[index % notes.length];
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(index % 4 === 0 ? 0.16 : 0.075, now + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.45);

    if (index % 2 === 0) {
      const shimmer = context.createOscillator();
      const shimmerGain = context.createGain();
      shimmer.type = "sine";
      shimmer.frequency.value = notes[(index + 2) % notes.length] * 4;
      shimmerGain.gain.setValueAtTime(0.025, now);
      shimmerGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
      shimmer.connect(shimmerGain).connect(context.destination);
      shimmer.start(now);
      shimmer.stop(now + 0.2);
    }
  }

  function stop() {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    void audioContext.current?.close();
    audioContext.current = null;
    beat.current = 0;
    setPlaying(false);
  }

  function toggle() {
    if (playing) {
      stop();
      return;
    }
    const context = new AudioContext();
    audioContext.current = context;
    scheduleNote(context, beat.current++);
    timer.current = setInterval(() => scheduleNote(context, beat.current++), 268);
    setPlaying(true);
  }

  useEffect(() => stop, []);

  return (
    <div className={`music-console-2026 ${playing ? "is-playing" : ""}`} aria-label="Interactive Music AI preview">
      <header><Music2 size={19} /><strong>Midnight Signal</strong><span>{playing ? "PLAYING" : "00:30"}</span></header>
      <div className="music-wave-2026" aria-hidden="true">{Array.from({ length: 72 }, (_, index) => <i key={index} style={{ height: `${18 + ((index * 19) % 74)}%` }} />)}</div>
      <div className="music-tracks-2026"><span><b>DRUMS</b><i /></span><span><b>BASS</b><i /></span><span><b>TEXTURE</b><i /></span><span><b>VOICE</b><i /></span></div>
      <footer><button type="button" onClick={toggle} aria-label={playing ? "Stop Midnight Signal" : "Play Midnight Signal"} aria-pressed={playing}>{playing ? <Pause size={17} /> : <Play size={17} />}</button><span>Bold · nocturnal · 112 BPM</span></footer>
    </div>
  );
}
