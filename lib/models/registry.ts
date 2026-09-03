import type {
  GenerationCapability,
  ModelDefinition,
  QualityTier,
} from "@/lib/types";

// Verified against OpenRouter discovery endpoints on 2026-09-01. The live catalog
// is merged into these curated choices by /api/models so model churn stays isolated.
export const curatedModels: ModelDefinition[] = [
  {
    id: "google/gemini-3.7-flash",
    provider: "google",
    capability: "text",
    displayName: "Creative Director",
    qualityTier: "standard",
    approximateCostUsd: 0.01,
    creditBase: 2,
    enabled: true,
    fallbackModel: "openai/gpt-5.4-mini",
  },
  {
    id: "google/gemini-3.5-flash-lite",
    provider: "google",
    capability: "text",
    displayName: "Creative Director Fast",
    qualityTier: "fast",
    approximateCostUsd: 0.004,
    creditBase: 1,
    enabled: true,
    fallbackModel: "google/gemini-3.7-flash",
  },
  {
    id: "openai/gpt-5.4-mini",
    provider: "openai",
    capability: "text",
    displayName: "Creative Director Premium",
    qualityTier: "premium",
    approximateCostUsd: 0.03,
    creditBase: 5,
    enabled: true,
    fallbackModel: "google/gemini-3.7-flash",
  },

  {
    id: "google/gemini-3.1-flash-lite-image",
    provider: "google",
    capability: "image",
    displayName: "Studio Image Fast",
    qualityTier: "fast",
    approximateCostUsd: 0.03,
    creditBase: 6,
    supportsReferenceImages: true,
    supportedAspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4"],
    enabled: true,
    fallbackModel: "openai/gpt-image-1-mini",
  },
  {
    id: "google/gemini-3.1-flash-image",
    provider: "google",
    capability: "image",
    displayName: "Studio Image",
    qualityTier: "standard",
    approximateCostUsd: 0.06,
    creditBase: 12,
    supportsReferenceImages: true,
    supportedAspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4"],
    enabled: true,
    fallbackModel: "bytedance-seed/seedream-5-0-lite",
  },
  {
    id: "bytedance-seed/seedream-5-0-pro",
    provider: "bytedance-seed",
    capability: "image",
    displayName: "Reference Studio",
    qualityTier: "premium",
    approximateCostUsd: 0.12,
    creditBase: 24,
    supportsReferenceImages: true,
    supportedAspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4"],
    enabled: true,
    fallbackModel: "openai/gpt-image-2",
  },
  {
    id: "recraft/recraft-v4.1-pro",
    provider: "recraft",
    capability: "image",
    displayName: "Design Studio",
    qualityTier: "advanced",
    approximateCostUsd: 0.21,
    creditBase: 35,
    supportsReferenceImages: true,
    supportedAspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4"],
    enabled: true,
  },

  {
    id: "bytedance/seedance-2.0-mini",
    provider: "bytedance",
    capability: "video",
    displayName: "Motion Draft",
    qualityTier: "fast",
    // Five seconds at 720p, calculated from OpenRouter's video-token formula.
    approximateCostUsd: 0.378,
    creditBase: 65,
    supportsAudio: true,
    supportsReferenceImages: true,
    supportsReferenceVideo: true,
    supportsImageToVideo: true,
    supportsTextToVideo: true,
    supportedDurations: [4, 5, 6, 8, 10],
    supportedAspectRatios: ["16:9", "9:16", "1:1"],
    enabled: true,
    fallbackModel: "bytedance/seedance-2.0-fast",
  },
  {
    id: "bytedance/seedance-2.5",
    provider: "bytedance",
    capability: "video",
    displayName: "Motion Studio",
    qualityTier: "standard",
    // Five seconds at 720p, calculated from OpenRouter's video-token formula.
    approximateCostUsd: 1.156,
    creditBase: 200,
    supportsAudio: true,
    supportsReferenceImages: true,
    supportsReferenceVideo: true,
    supportsImageToVideo: true,
    supportsTextToVideo: true,
    supportedDurations: [4, 5, 6, 8, 10],
    supportedAspectRatios: ["16:9", "9:16", "1:1"],
    enabled: true,
    fallbackModel: "kwaivgi/kling-v3.0-std",
  },
  {
    id: "google/veo-3.1",
    provider: "google",
    capability: "video",
    displayName: "Cinematic Premium",
    qualityTier: "premium",
    // Five-second normalized cost with native audio. Supported clips scale from it.
    approximateCostUsd: 2,
    creditBase: 340,
    supportsAudio: true,
    supportsReferenceImages: true,
    supportsImageToVideo: true,
    supportsTextToVideo: true,
    supportedDurations: [4, 6, 8],
    supportedAspectRatios: ["16:9", "9:16", "1:1"],
    enabled: true,
    fallbackModel: "google/veo-3.1-fast",
  },
  {
    id: "kwaivgi/kling-v3.0-std",
    provider: "kwaivgi",
    capability: "avatar",
    displayName: "Presenter Studio",
    qualityTier: "premium",
    // Five seconds at 720p with native audio.
    approximateCostUsd: 0.63,
    creditBase: 105,
    supportsAudio: true,
    supportsReferenceImages: true,
    supportsAvatar: true,
    supportedDurations: [5, 10],
    supportedAspectRatios: ["16:9", "9:16", "1:1"],
    enabled: true,
  },

  {
    id: "google/lyria-3-clip-preview",
    provider: "google",
    capability: "music",
    displayName: "Music Clip",
    qualityTier: "standard",
    // OpenRouter lists 30-second Lyria clips at $0.04 per generation.
    approximateCostUsd: 0.04,
    creditBase: 8,
    supportsMusic: true,
    supportedDurations: [30],
    enabled: true,
  },
  {
    id: "google/lyria-3-pro-preview",
    provider: "google",
    capability: "music",
    displayName: "Music Pro",
    qualityTier: "premium",
    // OpenRouter lists full-length Lyria songs at $0.08 per generation.
    approximateCostUsd: 0.08,
    creditBase: 14,
    supportsMusic: true,
    enabled: true,
    fallbackModel: "google/lyria-3-clip-preview",
  },

  {
    id: "deepgram/flux-tts:free",
    provider: "deepgram",
    capability: "speech",
    displayName: "Natural Voice Fast",
    qualityTier: "fast",
    approximateCostUsd: 0,
    creditBase: 1,
    supportsSpeech: true,
    enabled: true,
    fallbackModel: "hexgrad/kokoro-82m",
  },
  {
    id: "google/gemini-3.1-flash-tts-preview",
    provider: "google",
    capability: "speech",
    displayName: "Expressive Voice",
    qualityTier: "standard",
    approximateCostUsd: 0.02,
    creditBase: 4,
    supportsSpeech: true,
    enabled: true,
    fallbackModel: "microsoft/mai-voice-2-flash",
  },
  {
    id: "fish-audio/s2.1-pro",
    provider: "fish-audio",
    capability: "speech",
    displayName: "Voice Premium",
    qualityTier: "premium",
    approximateCostUsd: 0.08,
    creditBase: 14,
    supportsSpeech: true,
    enabled: true,
    fallbackModel: "google/gemini-3.1-flash-tts-preview",
  },

  {
    id: "openai/gpt-4o-mini-transcribe",
    provider: "openai",
    capability: "transcription",
    displayName: "Smart Transcript",
    qualityTier: "standard",
    approximateCostUsd: 0.02,
    creditBase: 4,
    supportsTranscription: true,
    enabled: true,
    fallbackModel: "openai/whisper-large-v3-turbo",
  },
  {
    id: "openai/gpt-4o-transcribe",
    provider: "openai",
    capability: "transcription",
    displayName: "Transcript Premium",
    qualityTier: "premium",
    approximateCostUsd: 0.06,
    creditBase: 12,
    supportsTranscription: true,
    enabled: true,
    fallbackModel: "openai/gpt-4o-mini-transcribe",
  },
];

export function routeModel(
  capability: GenerationCapability,
  quality: QualityTier = "standard",
  advancedModel?: string,
) {
  if (quality === "advanced" && advancedModel) {
    const selected = curatedModels.find(
      (model) =>
        model.id === advancedModel &&
        model.capability === capability &&
        model.enabled,
    );
    if (selected) return selected;
  }
  return (
    curatedModels.find(
      (model) =>
        model.capability === capability &&
        model.qualityTier === quality &&
        model.enabled,
    ) ||
    curatedModels.find(
      (model) =>
        model.capability === capability &&
        model.qualityTier === "standard" &&
        model.enabled,
    ) ||
    curatedModels.find(
      (model) => model.capability === capability && model.enabled,
    ) ||
    null
  );
}

export function estimateCredits(
  model: ModelDefinition,
  parameters: Record<string, unknown> = {},
) {
  if (model.capability === "video" || model.capability === "avatar") {
    const duration = Math.max(
      1,
      Math.min(Number(parameters.duration || 5), 30),
    );
    const resolutionMultiplier =
      parameters.resolution === "1080p"
        ? 1.45
        : parameters.resolution === "2K"
          ? 2
          : 1;
    return Math.ceil(model.creditBase * (duration / 5) * resolutionMultiplier);
  }
  if (model.capability === "image")
    return (
      model.creditBase * Math.max(1, Math.min(Number(parameters.count || 1), 4))
    );
  if (model.capability === "speech")
    return (
      model.creditBase *
      Math.max(1, Math.ceil(Number(parameters.characters || 0) / 1000))
    );
  if (model.capability === "transcription")
    return (
      model.creditBase *
      Math.max(1, Math.ceil(Number(parameters.durationSeconds || 60) / 60))
    );
  return model.creditBase;
}
