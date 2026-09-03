import "server-only";

const API_BASE = "https://openrouter.ai/api/v1";

function headers(contentType = "application/json") {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OpenRouter is not configured.");
  return {
    Authorization: `Bearer ${key}`,
    "Content-Type": contentType,
    "HTTP-Referer":
      process.env.OPENROUTER_APP_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000",
    "X-Title": process.env.OPENROUTER_APP_NAME || "OpenCreative",
  };
}

async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  let lastError = "OpenRouter request failed.";
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(`${API_BASE}${path}`, {
        ...init,
        headers: { ...headers(), ...(init?.headers || {}) },
        signal: AbortSignal.timeout(60_000),
      });
      if (response.ok) return response.json() as Promise<T>;
      const body = await response.text();
      lastError = `OpenRouter ${response.status}: ${body.slice(0, 500)}`;
      if (response.status < 500 && response.status !== 429) break;
    } catch (cause) {
      lastError =
        cause instanceof Error ? cause.message : "OpenRouter request failed.";
    }
    if (attempt < 2)
      await new Promise((resolve) => setTimeout(resolve, 450 * 2 ** attempt));
  }
  throw new Error(lastError);
}

export async function discoverModels(
  capability: "image" | "video" | "speech" | "transcription",
) {
  const path =
    capability === "image"
      ? "/images/models"
      : capability === "video"
        ? "/videos/models"
        : `/models?output_modalities=${capability}`;
  const response = await fetch(`${API_BASE}${path}`, {
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error("Could not refresh the model catalog.");
  return response.json() as Promise<{ data: Array<Record<string, unknown>> }>;
}

export async function creativeJson<T>({
  system,
  prompt,
  model = "google/gemini-3.7-flash",
  schemaName = "creative_plan",
  schema,
}: {
  system: string;
  prompt: string;
  model?: string;
  schemaName?: string;
  schema: Record<string, unknown>;
}) {
  const result = await apiJson<{
    choices: Array<{ message: { content: string } }>;
  }>("/chat/completions", {
    method: "POST",
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
      temperature: 0.6,
      response_format: {
        type: "json_schema",
        json_schema: { name: schemaName, strict: true, schema },
      },
      provider: { allow_fallbacks: true, data_collection: "deny" },
    }),
  });
  const content = result.choices[0]?.message?.content;
  if (!content) throw new Error("OpenRouter returned an empty creative plan.");
  return JSON.parse(content) as T;
}

export async function chatText(input: {
  system: string;
  message: string;
  model?: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
}) {
  const result = await apiJson<{
    choices: Array<{ message: { content: string } }>;
    usage?: Record<string, unknown>;
  }>("/chat/completions", {
    method: "POST",
    body: JSON.stringify({
      model: input.model || "google/gemini-3.5-flash-lite",
      messages: [
        { role: "system", content: input.system },
        ...(input.history || []).slice(-10),
        { role: "user", content: input.message },
      ],
      temperature: 0.35,
      max_tokens: 420,
      provider: { allow_fallbacks: true, data_collection: "deny" },
    }),
  });
  const text = result.choices[0]?.message?.content?.trim();
  if (!text) throw new Error("OpenRouter returned an empty agent response.");
  return { text, usage: result.usage };
}

export async function generateMusic(input: {
  model: string;
  prompt: string;
  format?: "wav" | "mp3";
}) {
  let lastError = "OpenRouter music generation failed.";
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetch(`${API_BASE}/chat/completions`, {
      method: "POST",
      headers: headers(),
      signal: AbortSignal.timeout(95_000),
      body: JSON.stringify({
        model: input.model,
        messages: [{ role: "user", content: input.prompt }],
        modalities: ["text", "audio"],
        audio: { format: input.format || "wav" },
        stream: true,
        provider: { data_collection: "deny" },
      }),
    });
    if (!response.ok) {
      lastError = `OpenRouter music ${response.status}: ${(await response.text()).slice(0, 500)}`;
      if (response.status !== 429 && response.status < 500) break;
      if (attempt < 2)
        await new Promise((resolve) => setTimeout(resolve, 1800 * 2 ** attempt));
      continue;
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("OpenRouter returned an empty music stream.");
    const decoder = new TextDecoder();
    let pending = "";
    let audioBase64 = "";
    let transcript = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      pending += decoder.decode(value, { stream: true });
      const lines = pending.split("\n");
      pending = lines.pop() || "";
      for (const line of lines) {
        if (!line.startsWith("data: ") || line === "data: [DONE]") continue;
        try {
          const chunk = JSON.parse(line.slice(6)) as {
            choices?: Array<{
              delta?: { audio?: { data?: string; transcript?: string } };
            }>;
          };
          const audio = chunk.choices?.[0]?.delta?.audio;
          if (audio?.data) audioBase64 += audio.data;
          if (audio?.transcript) transcript += audio.transcript;
        } catch {
          // Ignore provider keep-alive and non-JSON stream lines.
        }
      }
    }
    if (!audioBase64) {
      lastError = "OpenRouter returned no audio for this music request.";
      continue;
    }
    return {
      bytes: Buffer.from(audioBase64, "base64"),
      contentType: input.format === "mp3" ? "audio/mpeg" : "audio/wav",
      transcript,
    };
  }
  throw new Error(lastError);
}

export async function generateImage(input: {
  model: string;
  prompt: string;
  aspectRatio: string;
  count: number;
  quality?: string;
  references?: string[];
}) {
  const providerQuality =
    input.quality === "fast"
      ? "low"
      : input.quality === "premium" || input.quality === "advanced"
        ? "high"
        : "medium";
  return apiJson<{
    data: Array<{ b64_json: string; media_type?: string }>;
    usage?: Record<string, unknown>;
  }>("/images", {
    method: "POST",
    body: JSON.stringify({
      model: input.model,
      prompt: input.prompt,
      aspect_ratio: input.aspectRatio,
      n: input.count,
      quality: providerQuality,
      output_format: "webp",
      ...(input.references?.length
        ? {
            input_references: input.references.map((url) => ({
              type: "image_url",
              image_url: { url },
            })),
          }
        : {}),
      provider: { allow_fallbacks: true, data_collection: "deny" },
    }),
  });
}

export interface VideoJob {
  id: string;
  polling_url: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  generation_id?: string;
  unsigned_urls?: string[];
  error?: string;
  usage?: { cost?: number; is_byok?: boolean };
}

export async function submitVideo(input: {
  model: string;
  prompt: string;
  aspectRatio: string;
  duration: number;
  resolution: string;
  generateAudio: boolean;
  firstFrame?: string;
  references?: string[];
  callbackUrl?: string;
}) {
  return apiJson<VideoJob>("/videos", {
    method: "POST",
    body: JSON.stringify({
      model: input.model,
      prompt: input.prompt,
      aspect_ratio: input.aspectRatio,
      duration: input.duration,
      resolution: input.resolution,
      generate_audio: input.generateAudio,
      ...(input.firstFrame
        ? {
            frame_images: [
              {
                type: "image_url",
                image_url: { url: input.firstFrame },
                frame_type: "first_frame",
              },
            ],
          }
        : {}),
      ...(input.references?.length
        ? {
            input_references: input.references.map((url) => ({
              type: "image_url",
              image_url: { url },
            })),
          }
        : {}),
      ...(input.callbackUrl?.startsWith("https://")
        ? { callback_url: input.callbackUrl }
        : {}),
      provider: { allow_fallbacks: true, data_collection: "deny" },
    }),
  });
}

export async function getVideoJob(jobId: string) {
  if (!/^[a-zA-Z0-9_-]{3,200}$/.test(jobId))
    throw new Error("Invalid provider job id.");
  return apiJson<VideoJob>(`/videos/${jobId}`, { method: "GET" });
}

export async function downloadVideo(jobId: string) {
  if (!/^[a-zA-Z0-9_-]{3,200}$/.test(jobId))
    throw new Error("Invalid provider job id.");
  const response = await fetch(`${API_BASE}/videos/${jobId}/content?index=0`, {
    headers: headers(),
    signal: AbortSignal.timeout(120_000),
  });
  if (!response.ok)
    throw new Error(`Could not download completed video (${response.status}).`);
  return {
    bytes: Buffer.from(await response.arrayBuffer()),
    contentType: response.headers.get("content-type") || "video/mp4",
  };
}

export async function synthesizeSpeech(input: {
  model: string;
  text: string;
  voice: string;
  speed: number;
  format?: "mp3" | "wav";
}) {
  const requiresPcm = input.model.startsWith("google/gemini-");
  const response = await fetch(`${API_BASE}/audio/speech`, {
    method: "POST",
    headers: headers(),
    signal: AbortSignal.timeout(90_000),
    body: JSON.stringify({
      model: input.model,
      input: input.text,
      voice: input.voice,
      speed: input.speed,
      response_format: requiresPcm ? "pcm" : input.format || "mp3",
      provider: { data_collection: "deny" },
    }),
  });
  if (!response.ok)
    throw new Error(
      `OpenRouter speech ${response.status}: ${(await response.text()).slice(0, 300)}`,
    );
  const bytes = Buffer.from(await response.arrayBuffer());
  if (!requiresPcm)
    return {
      bytes,
      contentType: response.headers.get("content-type") || "audio/mpeg",
    };
  const header = Buffer.alloc(44);
  const sampleRate = 24000;
  const channels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * channels * bitsPerSample) / 8;
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + bytes.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE((channels * bitsPerSample) / 8, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36);
  header.writeUInt32LE(bytes.length, 40);
  return { bytes: Buffer.concat([header, bytes]), contentType: "audio/wav" };
}

export async function transcribeAudio(input: {
  model: string;
  base64: string;
  format: string;
  language?: string;
}) {
  return apiJson<{
    text: string;
    language?: string;
    duration?: number;
    segments?: unknown[];
    usage?: Record<string, unknown>;
  }>("/audio/transcriptions", {
    method: "POST",
    body: JSON.stringify({
      model: input.model,
      input_audio: { data: input.base64, format: input.format },
      language: input.language,
      // OpenRouter's current transcription contract accepts `json`; models
      // that do not implement OpenAI's verbose extension reject
      // `verbose_json` outright.
      response_format: "json",
      provider: { data_collection: "deny" },
    }),
  });
}
