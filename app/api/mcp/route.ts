import { NextResponse } from "next/server";
import { POST as createAvatar } from "@/app/api/generate/avatar/route";
import { POST as createImage } from "@/app/api/generate/image/route";
import { POST as createMusic } from "@/app/api/generate/music/route";
import { POST as createSpeech } from "@/app/api/generate/speech/route";
import { POST as createVideo } from "@/app/api/generate/video/route";
import { POST as createCampaignPlan } from "@/app/api/plan/route";

export const maxDuration = 120;

const protocolVersion = "2025-03-26";

const tools = [
  {
    name: "create_image",
    description: "Generate campaign images. Up to five public reference-image URLs can guide identity, product, composition, or style.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        prompt: { type: "string" },
        aspectRatio: { type: "string", enum: ["1:1", "16:9", "9:16", "4:3", "3:4"] },
        count: { type: "integer", minimum: 1, maximum: 4 },
        quality: { type: "string", enum: ["fast", "standard", "premium", "advanced"] },
        references: { type: "array", maxItems: 5, items: { type: "string", format: "uri" } },
      },
      required: ["prompt"],
    },
  },
  {
    name: "create_video",
    description: "Generate a video shot from a prompt, first frame, or up to five public reference URLs.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        prompt: { type: "string" },
        aspectRatio: { type: "string", enum: ["16:9", "9:16", "1:1"] },
        duration: { type: "integer", minimum: 3, maximum: 10 },
        resolution: { type: "string", enum: ["480p", "720p", "1080p"] },
        generateAudio: { type: "boolean" },
        quality: { type: "string", enum: ["fast", "standard", "premium", "advanced"] },
        firstFrame: { type: "string", format: "uri" },
        references: { type: "array", maxItems: 5, items: { type: "string", format: "uri" } },
      },
      required: ["prompt"],
    },
  },
  {
    name: "create_speech",
    description: "Generate multilingual speech with a selected voice and delivery speed.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        text: { type: "string" },
        voice: { type: "string" },
        speed: { type: "number", minimum: 0.7, maximum: 1.3 },
        quality: { type: "string", enum: ["fast", "standard", "premium"] },
      },
      required: ["text"],
    },
  },
  {
    name: "create_music",
    description: "Generate an original commercial soundtrack from a creative brief.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        prompt: { type: "string" },
        mood: { type: "string" },
        instrumental: { type: "boolean" },
        quality: { type: "string", enum: ["standard", "premium"] },
      },
      required: ["prompt"],
    },
  },
  {
    name: "create_avatar_video",
    description: "Create a consented talking-avatar video from the user's own reference photo and optional voice audio.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        script: { type: "string" },
        referenceImage: { type: "string", format: "uri" },
        voiceAudio: { type: "string", format: "uri" },
        aspectRatio: { type: "string", enum: ["16:9", "9:16", "1:1"] },
        duration: { type: "integer", minimum: 5, maximum: 30 },
        consent: { type: "boolean", const: true },
      },
      required: ["script", "referenceImage", "consent"],
    },
  },
  {
    name: "create_campaign_plan",
    description: "Turn one brief into three campaign concepts and an editable, shot-by-shot production plan.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        mode: { type: "string", enum: ["ugc", "marketing", "product_video"] },
        brief: { type: "string" },
        format: { type: "string" },
        tone: { type: "string" },
        duration: { type: "integer", minimum: 10, maximum: 60 },
        aspectRatio: { type: "string", enum: ["16:9", "9:16", "1:1"] },
        brandId: { type: "string", format: "uuid" },
        productId: { type: "string", format: "uuid" },
        avatarId: { type: "string", format: "uuid" },
      },
      required: ["mode", "brief"],
    },
  },
] as const;

const handlers: Record<string, (request: Request) => Promise<Response>> = {
  create_image: createImage,
  create_video: createVideo,
  create_speech: createSpeech,
  create_music: createMusic,
  create_avatar_video: createAvatar,
  create_campaign_plan: createCampaignPlan,
};

function rpcResult(id: unknown, result: unknown) {
  return NextResponse.json({ jsonrpc: "2.0", id, result });
}

function rpcError(id: unknown, code: number, message: string) {
  return NextResponse.json({ jsonrpc: "2.0", id, error: { code, message } });
}

export async function GET(request: Request) {
  return NextResponse.json({
    name: "OpenCreative MCP",
    protocolVersion,
    endpoint: new URL("/api/mcp", request.url).toString(),
    authentication: "Authorization: Bearer <OpenCreative Cloud MCP key>",
    tools: tools.map(({ name, description }) => ({ name, description })),
  });
}

export async function POST(request: Request) {
  let body: { id?: unknown; method?: string; params?: Record<string, unknown> };
  try {
    body = await request.json();
  } catch {
    return rpcError(null, -32700, "Parse error");
  }

  if (body.method === "notifications/initialized") return new Response(null, { status: 204 });
  if (body.method === "initialize") {
    return rpcResult(body.id, {
      protocolVersion,
      capabilities: { tools: { listChanged: false } },
      serverInfo: { name: "opencreative", version: "1.0.0" },
    });
  }
  if (body.method === "ping") return rpcResult(body.id, {});
  if (body.method === "tools/list") return rpcResult(body.id, { tools });
  if (body.method !== "tools/call") return rpcError(body.id, -32601, "Method not found");

  if (!request.headers.get("authorization")?.match(/^Bearer\s+\S+/i)) {
    return rpcError(body.id, -32001, "An OpenCreative Cloud MCP key is required.");
  }

  const name = typeof body.params?.name === "string" ? body.params.name : "";
  const handler = handlers[name];
  if (!handler) return rpcError(body.id, -32602, "Unknown tool");
  const args = body.params?.arguments && typeof body.params.arguments === "object"
    ? body.params.arguments
    : {};
  const toolRequest = new Request(request.url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: request.headers.get("authorization") || "",
    },
    body: JSON.stringify(args),
  });
  const response = await handler(toolRequest);
  const payload = await response.json().catch(() => ({ error: "The tool returned an unreadable response." }));
  return rpcResult(body.id, {
    content: [{ type: "text", text: JSON.stringify(payload) }],
    structuredContent: payload,
    isError: !response.ok,
  });
}
