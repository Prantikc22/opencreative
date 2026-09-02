import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function reserveCredits(input: {
  supabase: SupabaseClient;
  userId: string;
  generationId: string;
  credits: number;
  description: string;
}) {
  const { data, error } = await input.supabase.rpc("reserve_credits", {
    p_user_id: input.userId,
    p_generation_id: input.generationId,
    p_amount: input.credits,
    p_description: input.description,
  });
  if (error)
    throw new Error(
      error.message.includes("insufficient")
        ? "Insufficient credits"
        : error.message,
    );
  return data as number;
}

export async function settleCredits(input: {
  supabase: SupabaseClient;
  userId: string;
  generationId: string;
  actualCredits?: number;
}) {
  const { error } = await input.supabase.rpc("settle_credits", {
    p_user_id: input.userId,
    p_generation_id: input.generationId,
    p_actual_amount: input.actualCredits ?? null,
  });
  if (error) throw new Error(error.message);
}

export async function refundCredits(input: {
  supabase: SupabaseClient;
  userId: string;
  generationId: string;
  reason: string;
}) {
  const { error } = await input.supabase.rpc("refund_generation_credits", {
    p_user_id: input.userId,
    p_generation_id: input.generationId,
    p_reason: input.reason,
  });
  if (error) throw new Error(error.message);
}
