export type GenerationStatus =
  | "queued"
  | "planning"
  | "generating"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";
export type GenerationCapability =
  "text" | "image" | "video" | "speech" | "transcription" | "avatar";
export type QualityTier = "fast" | "standard" | "premium" | "advanced";

export interface ModelDefinition {
  id: string;
  provider: string;
  capability: GenerationCapability;
  displayName: string;
  qualityTier: QualityTier;
  approximateCostUsd: number;
  creditBase: number;
  supportsAudio?: boolean;
  supportsReferenceImages?: boolean;
  supportsReferenceVideo?: boolean;
  supportsImageToVideo?: boolean;
  supportsTextToVideo?: boolean;
  supportsSpeech?: boolean;
  supportsTranscription?: boolean;
  supportsAvatar?: boolean;
  supportedDurations?: number[];
  supportedAspectRatios?: string[];
  enabled: boolean;
  fallbackModel?: string;
}

export interface GenerationRecord {
  id: string;
  project_id: string | null;
  capability: GenerationCapability;
  status: GenerationStatus;
  provider_job_id: string | null;
  model_id: string;
  prompt: string;
  parameters: Record<string, unknown>;
  credit_cost: number;
  error_message: string | null;
  output_metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}
