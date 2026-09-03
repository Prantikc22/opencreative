import { NextResponse } from "next/server";
import { z } from "zod";
import { runAgentTurn, transcribeAgentAudio } from "@/lib/agents/provider";

export const maxDuration = 60;

const requestSchema = z.object({
  text: z.string().trim().min(1).max(1200).optional(),
  audio: z.object({
    base64: z.string().min(100).max(12_000_000),
    format: z.enum(["wav", "mp3", "flac", "m4a", "ogg", "webm", "aac"]),
  }).optional(),
  transcribeOnly: z.boolean().optional().default(false),
}).refine((value) => value.text || value.audio, "A text or voice question is required.");

const noriKnowledge = `
OpenCreative is an AI creative studio with separate product subscriptions for Creative Studio and OpenCreative Agents.
Creative Studio includes image generation, video generation, voice and multilingual speech, authorized avatars, and OpenRouter-powered music generation. New creative accounts receive 50 credits. Exact credit costs are shown before generation and failed jobs return reserved credits.
OpenCreative Agents lets a team create tenant-isolated voice and text customer agents grounded in approved knowledge. The production provider loop uses GPT-4o Mini Transcribe, Gemini 3.5 Flash Lite for reasoning, and Gemini 3.1 Flash TTS through OpenRouter.
Creative and Agent subscriptions are separate. Customers can add the other product family separately.
OpenCreative uses Supabase for identity and tenant data, private Cloudflare R2 media storage, and OpenRouter for model access. The open-source core and self-hosting guide are available from Resources.
The website has pricing, safety, privacy, terms, refunds, support, and acceptable-use pages. For account-specific billing or private project questions, direct the customer to sign in or contact support.
`;

const buckets = new Map<string, { count: number; resets: number }>();

function allowRequest(request: Request) {
  const key = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resets < now) {
    buckets.set(key, { count: 1, resets: now + 60_000 });
    return true;
  }
  current.count += 1;
  return current.count <= 12;
}

export async function POST(request: Request) {
  try {
    if (!allowRequest(request))
      return NextResponse.json({ error: "Please wait a moment before asking Nori again." }, { status: 429 });
    const input = requestSchema.parse(await request.json());
    if (input.transcribeOnly) {
      if (!input.audio)
        return NextResponse.json({ error: "Voice audio is required for transcription." }, { status: 400 });
      const transcription = await transcribeAgentAudio({ audio: input.audio, language: "en" });
      return NextResponse.json(transcription);
    }
    const result = await runAgentTurn({
      ...input,
      name: "Nori, the OpenCreative guide",
      knowledge: noriKnowledge,
      language: "en",
      voice: "Kore",
    });
    return NextResponse.json(result);
  } catch (cause) {
    if (cause instanceof z.ZodError)
      return NextResponse.json({ error: cause.issues[0]?.message || "Invalid request." }, { status: 400 });
    console.error("Nori provider error", cause);
    return NextResponse.json(
      { error: "Nori's voice service is temporarily unavailable. Please try again shortly." },
      { status: 502 },
    );
  }
}
