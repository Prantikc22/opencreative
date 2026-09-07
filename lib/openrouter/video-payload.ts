export type VideoGenerationInput = {
  model: string;
  prompt: string;
  aspectRatio: string;
  duration: number;
  resolution: string;
  generateAudio: boolean;
  firstFrame?: string;
  sourceVideo?: string;
  references?: string[];
  callbackUrl?: string;
};

export function buildVideoGenerationPayload(input: VideoGenerationInput) {
  const hasSourceVideo = Boolean(input.sourceVideo);
  const isUpscale = input.model === "black-forest-labs/flux-video-upscale";
  return {
    model: input.model,
    prompt: input.prompt,
    ...(!hasSourceVideo || input.model === "bytedance/seedance-2.5"
      ? {
          aspect_ratio: input.aspectRatio,
          duration: input.duration,
          resolution: input.resolution,
        }
      : {}),
    ...(!isUpscale ? { generate_audio: input.generateAudio } : {}),
    ...(isUpscale ? { upscale_factor: 2, creativity: 0 } : {}),
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
    ...(input.sourceVideo || input.references?.length
      ? {
          input_references: [
            ...(input.sourceVideo
              ? [{ type: "video_url", video_url: { url: input.sourceVideo } }]
              : []),
            ...(input.references || []).map((url) => ({
              type: "image_url",
              image_url: { url },
            })),
          ],
        }
      : {}),
    ...(input.callbackUrl?.startsWith("https://")
      ? { callback_url: input.callbackUrl }
      : {}),
    provider: { allow_fallbacks: true, data_collection: "deny" },
  };
}
