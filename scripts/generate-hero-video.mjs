import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey) throw new Error("OPENROUTER_API_KEY is not configured.");

const apiBase = "https://openrouter.ai/api/v1";
const headers = {
  Authorization: `Bearer ${apiKey}`,
  "Content-Type": "application/json",
  "HTTP-Referer": process.env.OPENROUTER_APP_URL || "http://localhost:3000",
  "X-Title": process.env.OPENROUTER_APP_NAME || "OpenCreative",
};

const prompt = [
  "Create an eight-second premium global brand film for the background of a creative platform landing page.",
  "It must feel like a real high-budget outdoor commercial, grounded and photographic, with three fluid match-cut moments rather than a collage.",
  "Begin at dawn in a wind-shaped coastal meadow as a South Asian woman walks through tall grass and runs her hand across the seed heads.",
  "Match cut the moving grass into fabric as a Black filmmaker lifts a compact cinema camera on a forest ridge, then into two diverse collaborators reviewing a beautiful product beside a clear alpine lake.",
  "Natural human movement, believable faces and anatomy, rich skin tones, wet leaves, ocean air, mountain scale, restrained coral sunlight, confident editorial styling, realistic lens behavior, subtle slow camera drift, and luxurious commercial color.",
  "Keep the left forty percent calmer and darker throughout so large white website copy remains readable, while the human action occupies the center and right.",
  "End on a wide hopeful landscape with the people small in frame so the clip can loop gently back to dawn.",
  "No readable text, no logos, no interface elements, no fantasy portals, no neon, no violet, no purple, no pale studio background, no audio.",
].join(" ");

async function openRouter(path, init = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers: { ...headers, ...(init.headers || {}) },
    signal: AbortSignal.timeout(120_000),
  });
  if (!response.ok) throw new Error(`OpenRouter ${response.status}: ${(await response.text()).slice(0, 800)}`);
  return response;
}

const submitted = await openRouter("/videos", {
  method: "POST",
  body: JSON.stringify({
    model: "google/veo-3.1-fast",
    prompt,
    aspect_ratio: "16:9",
    duration: 8,
    resolution: "1080p",
    generate_audio: false,
    seed: 91027,
    provider: { allow_fallbacks: true, data_collection: "deny" },
  }),
}).then((response) => response.json());

console.log(`Submitted OpenRouter video job ${submitted.id}`);

let job = submitted;
const startedAt = Date.now();
while (!["completed", "failed"].includes(job.status)) {
  if (Date.now() - startedAt > 15 * 60_000) throw new Error("Video generation timed out after 15 minutes.");
  await new Promise((resolveWait) => setTimeout(resolveWait, 10_000));
  job = await openRouter(`/videos/${submitted.id}`, { method: "GET" }).then((response) => response.json());
  console.log(`OpenRouter job status: ${job.status}`);
}

if (job.status === "failed") throw new Error(job.error || "OpenRouter video generation failed.");

const content = await openRouter(`/videos/${submitted.id}/content?index=0`, { method: "GET" });
const outputPath = resolve("public/opencreative-hero-v2.mp4");
await writeFile(outputPath, Buffer.from(await content.arrayBuffer()));
console.log(`Saved generated video to ${outputPath}`);
console.log(`Reported generation cost: ${job.usage?.cost ?? "not provided"}`);
