import { NextResponse } from "next/server";
import { z } from "zod";
import { apiContext, apiError } from "@/lib/api/context";
import { creativeJson } from "@/lib/openrouter/client";
const schema = z.object({
  mode: z.enum(["ugc", "marketing", "product_video"]),
  brief: z.string().trim().min(10).max(8000),
  brandId: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
  avatarId: z.string().uuid().optional(),
  format: z.string().max(80).default("Social Reel"),
  tone: z.string().max(80).default("Authentic"),
  duration: z.number().int().min(10).max(60).default(20),
  aspectRatio: z.enum(["16:9", "9:16", "1:1"]).default("9:16"),
});
const outputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    campaignTitle: { type: "string" },
    audience: { type: "string" },
    strategy: { type: "string" },
    concepts: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          name: { type: "string" },
          hook: { type: "string" },
          idea: { type: "string" },
          whyItWorks: { type: "string" },
        },
        required: ["name", "hook", "idea", "whyItWorks"],
      },
    },
    recommendedConcept: { type: "integer", minimum: 0, maximum: 2 },
    scenes: {
      type: "array",
      minItems: 3,
      maxItems: 8,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          visualPrompt: { type: "string" },
          voiceover: { type: "string" },
          onScreenText: { type: "string" },
          duration: { type: "number" },
          shotType: { type: "string" },
        },
        required: [
          "title",
          "description",
          "visualPrompt",
          "voiceover",
          "onScreenText",
          "duration",
          "shotType",
        ],
      },
    },
  },
  required: [
    "campaignTitle",
    "audience",
    "strategy",
    "concepts",
    "recommendedConcept",
    "scenes",
  ],
};
export async function POST(request: Request) {
  try {
    const context = await apiContext("creative", request);
    const input = schema.parse(await request.json());
    let memory = "";
    if (input.brandId) {
      const { data } = await context.supabase
        .from("brands")
        .select(
          "name,description,positioning,target_audience,tone,visual_style,preferred_phrases,banned_phrases,colors",
        )
        .eq("id", input.brandId)
        .eq("workspace_id", context.workspaceId)
        .single();
      if (data) memory += `\nBrand memory: ${JSON.stringify(data)}`;
    }
    if (input.productId) {
      const { data } = await context.supabase
        .from("products")
        .select("name,description,features,usp,price,target_audience,usage")
        .eq("id", input.productId)
        .eq("workspace_id", context.workspaceId)
        .single();
      if (data) memory += `\nProduct memory: ${JSON.stringify(data)}`;
    }
    const plan = await creativeJson<{
      campaignTitle: string;
      audience: string;
      strategy: string;
      concepts: Array<{
        name: string;
        hook: string;
        idea: string;
        whyItWorks: string;
      }>;
      recommendedConcept: number;
      scenes: Array<{
        title: string;
        description: string;
        visualPrompt: string;
        voiceover: string;
        onScreenText: string;
        duration: number;
        shotType: string;
      }>;
    }>({
      system: `You are OpenCreative's senior creative director. Build outcome-ready ${input.mode} work for a non-technical creator. Produce three genuinely different concepts and a coherent shot-by-shot storyboard, not one giant generation prompt. Respect supplied brand memory, never use banned phrases, never invent product claims, and keep scenes individually generatable.`,
      prompt: `Brief: ${input.brief}\nFormat: ${input.format}\nTone: ${input.tone}\nDuration: ${input.duration}s\nAspect ratio: ${input.aspectRatio}${memory}`,
      schemaName: "campaign_plan",
      schema: outputSchema,
    });
    const { data: project, error } = await context.supabase
      .from("projects")
      .insert({
        workspace_id: context.workspaceId,
        created_by: context.user.id,
        brand_id: input.brandId || null,
        product_id: input.productId || null,
        avatar_id: input.avatarId || null,
        title: plan.campaignTitle,
        project_type: input.mode,
        status: "planned",
        prompt: input.brief,
        concept: {
          audience: plan.audience,
          strategy: plan.strategy,
          concepts: plan.concepts,
          recommendedConcept: plan.recommendedConcept,
        },
        settings: {
          format: input.format,
          tone: input.tone,
          duration: input.duration,
          aspectRatio: input.aspectRatio,
        },
      })
      .select("id")
      .single();
    if (error) throw error;
    const { data: savedScenes, error: sceneError } = await context.supabase
      .from("project_scenes")
      .insert(
        plan.scenes.map((scene, index) => ({
          workspace_id: context.workspaceId,
          project_id: project.id,
          position: index,
          title: scene.title,
          description: scene.description,
          visual_prompt: scene.visualPrompt,
          voiceover: scene.voiceover,
          on_screen_text: scene.onScreenText,
          duration_seconds: scene.duration,
          metadata: { shotType: scene.shotType },
        })),
      )
      .select(
        "id,position,title,description,visual_prompt,voiceover,on_screen_text,duration_seconds,metadata",
      );
    if (sceneError) throw sceneError;
    return NextResponse.json({
      projectId: project.id,
      ...plan,
      scenes: (savedScenes || []).map((scene) => ({
        id: scene.id,
        title: scene.title,
        description: scene.description,
        visualPrompt: scene.visual_prompt,
        voiceover: scene.voiceover,
        onScreenText: scene.on_screen_text,
        duration: Number(scene.duration_seconds),
        shotType: (scene.metadata as { shotType?: string })?.shotType || "shot",
      })),
    });
  } catch (cause) {
    const error = apiError(cause);
    return NextResponse.json(
      { error: error.message },
      { status: cause instanceof z.ZodError ? 400 : error.status },
    );
  }
}
