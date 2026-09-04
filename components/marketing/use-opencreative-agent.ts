"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type AgentMessage = { role: "user" | "agent"; text: string };
type AgentResponse = {
  transcript: string;
  text: string;
  audioBase64?: string;
  audioMimeType?: string;
  sessionId?: string;
  error?: string;
};

const welcome = "Hi, I am Nori, the OpenCreative product guide. Ask me about images, video, voices, avatars, music, agents, credits, or plans.";

function bytesFromBase64(value: string) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

export function useOpenCreativeAgent(endpoint = "/api/nori", initialWelcome = welcome) {
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionId = useRef<string | undefined>(undefined);
  const audio = useRef<HTMLAudioElement | null>(null);
  const [messages, setMessages] = useState<AgentMessage[]>([{ role: "agent", text: initialWelcome }]);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => () => {
    if (timeout.current) clearTimeout(timeout.current);
    if (recorder.current?.state === "recording") recorder.current.stop();
    stream.current?.getTracks().forEach((track) => track.stop());
    audio.current?.pause();
  }, []);

  const play = useCallback(async (base64?: string, mimeType = "audio/wav") => {
    if (!base64) return;
    audio.current?.pause();
    const url = URL.createObjectURL(new Blob([bytesFromBase64(base64)], { type: mimeType }));
    const next = new Audio(url);
    audio.current = next;
    next.onplay = () => setSpeaking(true);
    next.onended = () => { setSpeaking(false); URL.revokeObjectURL(url); };
    next.onerror = () => { setSpeaking(false); URL.revokeObjectURL(url); };
    await next.play().catch(() => setSpeaking(false));
  }, []);

  const request = useCallback(async (payload: Record<string, unknown>) => {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, ...(sessionId.current ? { sessionId: sessionId.current } : {}) }),
    });
    const result = await response.json() as AgentResponse;
    if (!response.ok || result.error) throw new Error(result.error || "The agent could not answer.");
    if (result.sessionId) sessionId.current = result.sessionId;
    return result;
  }, [endpoint]);

  const answer = useCallback(async (question: string, appendQuestion = true, synthesize = false) => {
    if (sending || transcribing) return;
    setSending(true);
    setError("");
    if (appendQuestion) setMessages((current) => [...current, { role: "user", text: question }]);
    try {
      const result = await request({ text: question, synthesize });
      setMessages((current) => [...current, { role: "agent", text: "" }]);
      const typing = (async () => {
        const step = Math.max(2, Math.ceil(result.text.length / 90));
        for (let length = step; length < result.text.length; length += step) {
          setMessages((current) => current.map((message, index) =>
            index === current.length - 1 ? { ...message, text: result.text.slice(0, length) } : message,
          ));
          await new Promise((resolve) => setTimeout(resolve, 14));
        }
        setMessages((current) => current.map((message, index) =>
          index === current.length - 1 ? { ...message, text: result.text } : message,
        ));
      })();
      await Promise.all([typing, play(result.audioBase64, result.audioMimeType)]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The agent could not answer. Please try again.");
    } finally {
      setSending(false);
    }
  }, [play, request, sending, transcribing]);

  const ask = useCallback((rawQuestion: string) => {
    const question = rawQuestion.trim();
    if (!question) return;
    void answer(question);
  }, [answer]);

  const stopListening = useCallback(() => {
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = null;
    if (recorder.current?.state === "recording") recorder.current.stop();
    setListening(false);
  }, []);

  const startListening = useCallback(async () => {
    if (listening) {
      stopListening();
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("Voice recording is not available in this browser. Type your question instead.");
      return;
    }
    try {
      audio.current?.pause();
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.current = mediaStream;
      const preferred = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus"].find((type) => MediaRecorder.isTypeSupported(type));
      const next = new MediaRecorder(mediaStream, preferred ? { mimeType: preferred } : undefined);
      const chunks: Blob[] = [];
      next.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
      next.onerror = () => setError("I could not record that. Try again or type the question.");
      next.onstop = async () => {
        mediaStream.getTracks().forEach((track) => track.stop());
        setListening(false);
        const blob = new Blob(chunks, { type: next.mimeType || "audio/webm" });
        if (blob.size < 100) return;
        const array = new Uint8Array(await blob.arrayBuffer());
        let binary = "";
        for (let index = 0; index < array.length; index += 0x8000)
          binary += String.fromCharCode(...array.subarray(index, index + 0x8000));
        const mime = blob.type.toLowerCase();
        const format = mime.includes("ogg") ? "ogg" : mime.includes("mp4") ? "m4a" : "webm";
        const audioInput = { base64: btoa(binary), format };
        setTranscribing(true);
        setError("");
        try {
          const transcription = await request({ audio: audioInput, transcribeOnly: true });
          const transcript = transcription.transcript.trim();
          setMessages((current) => [...current, { role: "user", text: transcript }]);
          setTranscribing(false);
          await answer(transcript, false, true);
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : "I could not transcribe that. Please try again.");
          setTranscribing(false);
        }
      };
      recorder.current = next;
      setError("");
      setListening(true);
      next.start();
      timeout.current = setTimeout(stopListening, 12_000);
    } catch {
      setListening(false);
      setError("Microphone access was not granted. Type your question or allow microphone access.");
    }
  }, [answer, listening, request, stopListening]);

  return { messages, listening, speaking, sending, transcribing, error, ask, startListening };
}
