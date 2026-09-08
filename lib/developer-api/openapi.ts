import { productConfig } from "@/lib/config";

const bearerSecurity = [{ bearerAuth: [] }];
const errorResponses = {
  "400": { description: "Invalid request" },
  "401": { description: "Missing or invalid API key" },
  "402": { description: "Insufficient credits" },
  "403": { description: "Creative API access is not enabled" },
  "429": { description: "Provider capacity or rate limit reached" },
  "500": { description: "Generation failed; reserved credits are returned" },
};

export function openCreativeOpenApi() {
  return {
    openapi: "3.1.0",
    info: {
      title: "OpenCreative API",
      version: "1.0.0",
      description: "Create images, video, speech, music, transcriptions, and avatar renders with one workspace credit wallet.",
    },
    servers: [{ url: productConfig.appUrl }],
    security: bearerSecurity,
    paths: {
      "/api/v1/images": {
        post: {
          summary: "Generate images",
          operationId: "createImage",
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/ImageRequest" } } } },
          responses: { "200": { description: "Completed image generation" }, ...errorResponses },
        },
      },
      "/api/v1/videos": {
        post: {
          summary: "Generate or transform video",
          operationId: "createVideo",
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/VideoRequest" } } } },
          responses: { "200": { description: "Queued video generation" }, ...errorResponses },
        },
      },
      "/api/v1/speech": {
        post: {
          summary: "Generate speech",
          operationId: "createSpeech",
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/SpeechRequest" } } } },
          responses: { "200": { description: "Completed speech generation" }, ...errorResponses },
        },
      },
      "/api/v1/music": {
        post: {
          summary: "Generate original music",
          operationId: "createMusic",
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/MusicRequest" } } } },
          responses: { "200": { description: "Completed music generation" }, ...errorResponses },
        },
      },
      "/api/v1/avatars": {
        post: {
          summary: "Generate a consented talking avatar",
          operationId: "createAvatar",
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/AvatarRequest" } } } },
          responses: { "200": { description: "Queued avatar generation" }, ...errorResponses },
        },
      },
      "/api/v1/transcriptions": {
        post: {
          summary: "Transcribe audio or video",
          operationId: "createTranscription",
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/TranscriptionRequest" } } } },
          responses: { "200": { description: "Completed transcription" }, ...errorResponses },
        },
      },
      "/api/v1/generations/{id}": {
        get: {
          summary: "Get a generation and signed output URLs",
          operationId: "getGeneration",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
          responses: { "200": { description: "Generation status and assets" }, ...errorResponses },
        },
      },
      "/api/v1/models": {
        get: {
          summary: "List available models by capability",
          operationId: "listModels",
          parameters: [{ name: "capability", in: "query", schema: { type: "string", enum: ["image", "video", "speech", "transcription"], default: "image" } }],
          responses: { "200": { description: "Curated live model catalog" }, ...errorResponses },
        },
      },
      "/api/v1/credits": {
        get: {
          summary: "Get the workspace credit balance",
          operationId: "getCreditBalance",
          responses: { "200": { description: "Current prepaid and subscription credit balance" }, ...errorResponses },
        },
      },
    },
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "oc_live_…" },
      },
      schemas: {
        ImageRequest: {
          type: "object",
          required: ["prompt"],
          properties: {
            prompt: { type: "string", minLength: 3, maxLength: 8000 },
            aspectRatio: { type: "string", enum: ["1:1", "16:9", "9:16", "4:3", "3:4"], default: "1:1" },
            quality: { $ref: "#/components/schemas/Quality" },
            count: { type: "integer", minimum: 1, maximum: 4, default: 1 },
            references: { type: "array", maxItems: 5, items: { type: "string", format: "uri" } },
            operation: { type: "string", examples: ["create-image", "edit-image", "remove-background"] },
            idempotencyKey: { type: "string", format: "uuid" },
          },
        },
        VideoRequest: {
          type: "object",
          required: ["prompt"],
          properties: {
            prompt: { type: "string", minLength: 3, maxLength: 8000 },
            aspectRatio: { type: "string", enum: ["16:9", "9:16", "1:1"], default: "16:9" },
            duration: { type: "integer", minimum: 3, maximum: 10, default: 5 },
            resolution: { type: "string", enum: ["480p", "720p", "1080p"], default: "720p" },
            generateAudio: { type: "boolean", default: true },
            quality: { $ref: "#/components/schemas/Quality" },
            firstFrame: { type: "string", format: "uri" },
            sourceVideo: { type: "string", format: "uri" },
            references: { type: "array", maxItems: 5, items: { type: "string", format: "uri" } },
            operation: { type: "string", examples: ["text-to-video", "frame-to-video", "edit-video"] },
            idempotencyKey: { type: "string", format: "uuid" },
          },
        },
        SpeechRequest: {
          type: "object", required: ["text"],
          properties: { text: { type: "string", maxLength: 10000 }, voice: { type: "string", default: "alloy" }, speed: { type: "number", minimum: 0.7, maximum: 1.3, default: 1 }, quality: { type: "string", enum: ["fast", "standard", "premium"] }, idempotencyKey: { type: "string", format: "uuid" } },
        },
        MusicRequest: {
          type: "object", required: ["prompt"],
          properties: { prompt: { type: "string", minLength: 10, maxLength: 3000 }, mood: { type: "string", default: "Cinematic" }, instrumental: { type: "boolean", default: true }, quality: { type: "string", enum: ["standard", "premium"] }, idempotencyKey: { type: "string", format: "uuid" } },
        },
        AvatarRequest: {
          type: "object", required: ["script", "referenceImage", "consent"],
          properties: { script: { type: "string", maxLength: 5000 }, referenceImage: { type: "string", format: "uri" }, voiceAudio: { type: "string", format: "uri" }, consent: { type: "boolean", const: true }, aspectRatio: { type: "string", enum: ["16:9", "9:16", "1:1"] }, duration: { type: "integer", minimum: 5, maximum: 30 }, idempotencyKey: { type: "string", format: "uuid" } },
        },
        TranscriptionRequest: {
          type: "object", required: ["base64", "format"],
          properties: { base64: { type: "string", description: "Base64-encoded audio or video bytes" }, format: { type: "string", enum: ["wav", "mp3", "flac", "m4a", "ogg", "webm", "aac", "mp4", "mov"] }, language: { type: "string", minLength: 2, maxLength: 2 }, durationSeconds: { type: "number", maximum: 3600 }, quality: { type: "string", enum: ["standard", "premium"] }, idempotencyKey: { type: "string", format: "uuid" } },
        },
        Quality: { type: "string", enum: ["fast", "standard", "premium", "advanced"], default: "standard" },
      },
    },
  } as const;
}
