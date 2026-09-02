import { NextResponse } from "next/server";
import { z } from "zod";
import { apiContext, apiError } from "@/lib/api/context";
const kindSchema = z.enum(["brands", "products", "avatars"]);
const brandSchema = z.object({
  name: z.string().trim().min(1).max(120),
  website: z.string().url().or(z.literal("")).optional(),
  industry: z.string().max(120).optional(),
  description: z.string().max(4000).optional(),
  positioning: z.string().max(2000).optional(),
  targetAudience: z.string().max(2000).optional(),
  colors: z
    .array(z.string().regex(/^#[0-9a-f]{6}$/i))
    .max(8)
    .default([]),
  tone: z.array(z.string().max(80)).max(12).default([]),
  visualStyle: z.array(z.string().max(80)).max(12).default([]),
});
const productSchema = z.object({
  name: z.string().trim().min(1).max(160),
  brandId: z.string().uuid().or(z.literal("")).optional(),
  description: z.string().max(5000).optional(),
  features: z.array(z.string().max(300)).max(30).default([]),
  usp: z.string().max(2000).optional(),
  price: z.string().max(100).optional(),
  targetAudience: z.string().max(2000).optional(),
  usage: z.string().max(2000).optional(),
});
const avatarSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    sourceType: z.enum(["generated", "authorized_upload", "stock"]),
    personality: z.string().max(2000).optional(),
    speakingStyle: z.string().max(1000).optional(),
    preferredLanguage: z.string().max(100).optional(),
    tags: z.array(z.string().max(80)).max(20).default([]),
    consent: z.boolean().default(false),
  })
  .refine(
    (value) => value.sourceType !== "authorized_upload" || value.consent,
    { message: "Consent confirmation is required for uploaded identities." },
  );
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ kind: string }> },
) {
  try {
    const context = await apiContext();
    const kind = kindSchema.parse((await params).kind);
    const { data, error } = await context.supabase
      .from(kind)
      .select("*")
      .eq("workspace_id", context.workspaceId)
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ items: data });
  } catch (cause) {
    const error = apiError(cause);
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  }
}
export async function POST(
  request: Request,
  { params }: { params: Promise<{ kind: string }> },
) {
  try {
    const context = await apiContext();
    const kind = kindSchema.parse((await params).kind);
    const raw = await request.json();
    let payload: Record<string, unknown>;
    if (kind === "brands") {
      const i = brandSchema.parse(raw);
      payload = {
        workspace_id: context.workspaceId,
        created_by: context.user.id,
        name: i.name,
        website: i.website || null,
        industry: i.industry || null,
        description: i.description || null,
        positioning: i.positioning || null,
        target_audience: i.targetAudience || null,
        colors: i.colors,
        tone: i.tone,
        visual_style: i.visualStyle,
      };
    } else if (kind === "products") {
      const i = productSchema.parse(raw);
      payload = {
        workspace_id: context.workspaceId,
        created_by: context.user.id,
        name: i.name,
        brand_id: i.brandId || null,
        description: i.description || null,
        features: i.features,
        usp: i.usp || null,
        price: i.price || null,
        target_audience: i.targetAudience || null,
        usage: i.usage || null,
      };
    } else {
      const i = avatarSchema.parse(raw);
      payload = {
        workspace_id: context.workspaceId,
        created_by: context.user.id,
        name: i.name,
        source_type: i.sourceType,
        personality: i.personality || null,
        speaking_style: i.speakingStyle || null,
        preferred_language: i.preferredLanguage || null,
        tags: i.tags,
        consent_confirmed_at: i.consent ? new Date().toISOString() : null,
      };
    }
    const { data, error } = await context.supabase
      .from(kind)
      .insert(payload)
      .select("id")
      .single();
    if (error) throw error;
    return NextResponse.json({ id: data.id }, { status: 201 });
  } catch (cause) {
    const error = apiError(cause);
    return NextResponse.json(
      { error: error.message },
      { status: cause instanceof z.ZodError ? 400 : error.status },
    );
  }
}
