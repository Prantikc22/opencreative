import { NextResponse } from "next/server";
import { z } from "zod";
import { apiContext, apiError } from "@/lib/api/context";
import { creativeJson } from "@/lib/openrouter/client";

const inputSchema = z.object({ prompt: z.string().trim().min(5).max(4000) });
const outputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    intent: {
      type: "string",
      enum: [
        "ugc",
        "ad",
        "product_video",
        "video",
        "image",
        "avatar",
        "voice",
        "dub",
      ],
    },
    title: { type: "string" },
    brief: { type: "string" },
    aspectRatio: {
      type: "string",
      enum: ["1:1", "16:9", "9:16", "4:3", "3:4"],
    },
    quality: { type: "string", enum: ["fast", "standard", "premium"] },
    duration: { type: "integer", minimum: 3, maximum: 30 },
  },
  required: ["intent", "title", "brief", "aspectRatio", "quality", "duration"],
};
const routes: Record<string, string> = {
  ugc: "/create/ugc",
  ad: "/create/ad",
  product_video: "/create/product-video",
  video: "/studio/video",
  image: "/studio/image",
  avatar: "/studio/avatar",
  voice: "/studio/audio",
  dub: "/studio/audio?mode=dub",
};
export async function POST(request: Request) {
  try {
    await apiContext("creative");
    const { prompt } = inputSchema.parse(await request.json());
    const plan = await creativeJson<{
      intent: string;
      title: string;
      brief: string;
      aspectRatio: string;
      quality: string;
      duration: number;
    }>({
      system:
        "You are OpenCreative's intent router. Infer the finished creative outcome a non-technical creator wants. Choose one workflow, keep their language, and choose conservative cost settings unless they explicitly ask for premium quality. Do not add claims or facts.",
      prompt,
      schemaName: "creative_intent",
      schema: outputSchema,
    });
    return NextResponse.json({
      ...plan,
      prompt,
      route: routes[plan.intent] || "/create/ad",
    });
  } catch (cause) {
    const error = apiError(cause);
    return NextResponse.json(
      { error: error.message },
      { status: cause instanceof z.ZodError ? 400 : error.status },
    );
  }
}
