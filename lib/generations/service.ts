import "server-only";
import { randomUUID } from "crypto";
import type { ModelDefinition } from "@/lib/types";
import { estimateCredits } from "@/lib/models/registry";
import { assertGenerationAllowed } from "@/lib/security/guard";
import {
  reserveCredits,
  refundCredits,
  settleCredits,
} from "@/lib/credits/engine";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function createGeneration(input: {
  supabase: SupabaseClient;
  workspaceId: string;
  userId: string;
  projectId?: string;
  sceneId?: string;
  model: ModelDefinition;
  prompt: string;
  parameters: Record<string, unknown>;
  idempotencyKey?: string;
}) {
  await assertGenerationAllowed(
    input.supabase,
    input.userId,
    input.model.capability,
  );
  const creditCost = estimateCredits(input.model, input.parameters);
  const idempotencyKey = input.idempotencyKey || randomUUID();
  const { data: existing } = await input.supabase
    .from("generations")
    .select("*")
    .eq("user_id", input.userId)
    .eq("idempotency_key", idempotencyKey)
    .maybeSingle();
  if (existing) return { generation: existing, created: false };
  const { data: generation, error } = await input.supabase
    .from("generations")
    .insert({
      workspace_id: input.workspaceId,
      user_id: input.userId,
      project_id: input.projectId || null,
      scene_id: input.sceneId || null,
      capability: input.model.capability,
      status: "queued",
      model_id: input.model.id,
      model_snapshot: input.model,
      prompt: input.prompt,
      parameters: input.parameters,
      credit_cost: creditCost,
      provider_estimated_cost: input.model.approximateCostUsd,
      idempotency_key: idempotencyKey,
    })
    .select("*")
    .single();
  if (error) throw error;
  try {
    await reserveCredits({
      supabase: input.supabase,
      userId: input.userId,
      generationId: generation.id,
      credits: creditCost,
      description: `Reserved for ${input.model.displayName}`,
    });
    await input.supabase.from("usage_events").insert({
      workspace_id: input.workspaceId,
      user_id: input.userId,
      generation_id: generation.id,
      event_type: "generation_submit",
      capability: input.model.capability,
      model_id: input.model.id,
      quantity: 1,
    });
  } catch (cause) {
    await input.supabase
      .from("generations")
      .update({
        status: "failed",
        error_code: "credit_reservation_failed",
        error_message:
          cause instanceof Error ? cause.message : "Credit reservation failed",
      })
      .eq("id", generation.id);
    throw cause;
  }
  return { generation, created: true };
}

export async function failGeneration(input: {
  supabase: SupabaseClient;
  generationId: string;
  userId: string;
  error: unknown;
  refund?: boolean;
}) {
  const message =
    input.error instanceof Error ? input.error.message : "Generation failed";
  await input.supabase
    .from("generations")
    .update({
      status: "failed",
      error_code: "provider_failure",
      error_message: message.slice(0, 500),
      completed_at: new Date().toISOString(),
    })
    .eq("id", input.generationId)
    .eq("user_id", input.userId);
  if (input.refund !== false)
    await refundCredits({
      supabase: input.supabase,
      userId: input.userId,
      generationId: input.generationId,
      reason: "Generation failed. Credits returned",
    });
}
export async function completeGeneration(input: {
  supabase: SupabaseClient;
  generationId: string;
  userId: string;
  outputMetadata?: Record<string, unknown>;
  actualCost?: number;
  actualCredits?: number;
}) {
  await input.supabase
    .from("generations")
    .update({
      status: "completed",
      output_metadata: input.outputMetadata || {},
      provider_actual_cost: input.actualCost ?? null,
      completed_at: new Date().toISOString(),
    })
    .eq("id", input.generationId)
    .eq("user_id", input.userId);
  await settleCredits({
    supabase: input.supabase,
    userId: input.userId,
    generationId: input.generationId,
    actualCredits: input.actualCredits,
  });
}
