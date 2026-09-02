import { NextResponse } from "next/server";
import { z } from "zod";
import { apiContext, apiError } from "@/lib/api/context";
import { curatedModels } from "@/lib/models/registry";
import { discoverModels } from "@/lib/openrouter/client";

const capabilitySchema = z.enum(["image", "video", "speech", "transcription"]);
export async function GET(request: Request) {
  try {
    await apiContext();
    const capability = capabilitySchema.parse(
      new URL(request.url).searchParams.get("capability") || "image",
    );
    let liveIds = new Set<string>();
    try {
      const live = await discoverModels(capability);
      liveIds = new Set(live.data.map((item) => String(item.id)));
    } catch {}
    const models = curatedModels
      .filter(
        (model) =>
          model.capability === capability ||
          (capability === "video" && model.capability === "avatar"),
      )
      .map((model) => ({
        ...model,
        available: liveIds.size ? liveIds.has(model.id) : true,
      }));
    return NextResponse.json(
      { models, refreshedAt: new Date().toISOString() },
      { headers: { "Cache-Control": "private, max-age=300" } },
    );
  } catch (cause) {
    const error = apiError(cause);
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  }
}
