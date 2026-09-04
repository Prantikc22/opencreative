import "server-only";
import { chatText, synthesizeSpeech, transcribeAudio } from "@/lib/openrouter/client";

export const agentModels = {
  transcription: "openai/gpt-4o-mini-transcribe",
  reasoning: "google/gemini-3.5-flash-lite",
  speech: "google/gemini-3.1-flash-tts-preview",
} as const;

const legacyVoiceMap: Record<string, string> = {
  alloy: "Kore",
  nova: "Aoede",
  onyx: "Orus",
  shimmer: "Leda",
};

export type AgentAudioInput = {
  base64: string;
  format: "wav" | "mp3" | "flac" | "m4a" | "ogg" | "webm" | "aac";
};

export async function transcribeAgentAudio(input: {
  audio: AgentAudioInput;
  language?: string;
}) {
  const transcription = await transcribeAudio({
    model: agentModels.transcription,
    base64: input.audio.base64,
    format: input.audio.format,
    language: input.language?.slice(0, 2),
  });
  const transcript = transcription.text.trim();
  if (!transcript) throw new Error("I could not hear a question. Please try again.");
  return {
    transcript,
    duration: Math.max(0, Number(transcription.duration || 0)),
    model: agentModels.transcription,
  };
}

export async function runAgentTurn(input: {
  text?: string;
  audio?: AgentAudioInput;
  name: string;
  knowledge: string;
  systemPrompt?: string;
  language?: string;
  voice?: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
  synthesize?: boolean;
}) {
  let message = input.text?.trim() || "";
  let inputAudioSeconds = 0;
  if (!message && input.audio) {
    const transcription = await transcribeAgentAudio({
      audio: input.audio,
      language: input.language,
    });
    message = transcription.transcript;
    inputAudioSeconds = transcription.duration;
  }
  if (!message) throw new Error("Say or type a question first.");

  const system = [
    `You are ${input.name}, an AI customer agent.`,
    input.systemPrompt || "Answer accurately and concisely from the approved knowledge only.",
    `Reply in the same language as the customer unless they ask for another language. Preferred locale: ${input.language || "en"}.`,
    "Never invent product facts, policies, prices, account data, or completed actions.",
    "If the approved knowledge does not contain the answer, say that clearly and offer a human handoff.",
    "Keep spoken answers under 90 words.",
    `APPROVED KNOWLEDGE:\n${input.knowledge.slice(0, 24_000)}`,
  ].join("\n\n");

  const answer = await chatText({
    system,
    message,
    model: agentModels.reasoning,
    history: input.history,
  });
  const shouldSynthesize = input.synthesize ?? Boolean(input.audio);
  const speech = shouldSynthesize ? await synthesizeSpeech({
    model: agentModels.speech,
    text: answer.text,
    voice: legacyVoiceMap[(input.voice || "").toLowerCase()] || input.voice || "Kore",
    speed: 1,
    format: "wav",
  }) : null;
  const outputAudioSeconds = speech?.contentType === "audio/wav"
    ? Math.max(0, (speech.bytes.length - 44) / 48_000)
    : 0;
  const usageSeconds = Math.max(1, inputAudioSeconds + outputAudioSeconds);

  return {
    transcript: message,
    text: answer.text,
    audioBase64: speech?.bytes.toString("base64"),
    audioMimeType: speech?.contentType,
    usageSeconds,
    usage: answer.usage || {},
    models: agentModels,
  };
}
