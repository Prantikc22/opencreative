import { NextResponse } from "next/server";
import { apiContext, apiError } from "@/lib/api/context";

export async function GET(request: Request) {
  try {
    const { supabase, workspaceId } = await apiContext(undefined, request);
    const { data, error } = await supabase.from("credit_wallets").select("balance").eq("workspace_id", workspaceId).single();
    if (error) throw error;
    return NextResponse.json({ balance: data.balance }, { headers: { "Cache-Control": "no-store" } });
  } catch (cause) {
    const error = apiError(cause);
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
}
