import { describe, expect, it } from "vitest";
import { buildVideoGenerationPayload } from "@/lib/openrouter/video-payload";

const base = {
  prompt: "Make the lighting warmer",
  aspectRatio: "16:9",
  duration: 5,
  resolution: "720p",
  generateAudio: true,
};

describe("OpenRouter video payloads", () => {
  it("sends uploaded footage as a video reference for editing", () => {
    const payload = buildVideoGenerationPayload({
      ...base,
      model: "runway/aleph-2",
      sourceVideo: "https://assets.example/source.mp4",
      references: ["https://assets.example/character.png"],
    });
    expect(payload.input_references).toEqual([
      { type: "video_url", video_url: { url: "https://assets.example/source.mp4" } },
      { type: "image_url", image_url: { url: "https://assets.example/character.png" } },
    ]);
    expect(payload).not.toHaveProperty("duration");
  });

  it("uses the dedicated upscale contract", () => {
    const payload = buildVideoGenerationPayload({
      ...base,
      model: "black-forest-labs/flux-video-upscale",
      sourceVideo: "https://assets.example/source.mp4",
    });
    expect(payload).toMatchObject({ upscale_factor: 2, creativity: 0 });
    expect(payload).not.toHaveProperty("generate_audio");
  });

  it("uses an exact first frame for frame-to-video", () => {
    const payload = buildVideoGenerationPayload({
      ...base,
      model: "google/veo-3.1",
      firstFrame: "https://assets.example/frame.png",
    });
    expect(payload.frame_images?.[0]).toMatchObject({
      frame_type: "first_frame",
      image_url: { url: "https://assets.example/frame.png" },
    });
  });
});
