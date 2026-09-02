import "server-only";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function assertGenerationAllowed(
  supabase: SupabaseClient,
  userId: string,
  capability: string,
) {
  const windowStart = new Date(Date.now() - 60_000).toISOString();
  const [{ count: recent }, { count: concurrent }] = await Promise.all([
    supabase
      .from("usage_events")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("event_type", "generation_submit")
      .gte("created_at", windowStart),
    supabase
      .from("generations")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .in("status", ["queued", "planning", "generating", "processing"]),
  ]);
  if ((recent || 0) >= 10) throw new Error("Rate limit exceeded");
  if ((concurrent || 0) >= (capability === "video" ? 2 : 4))
    throw new Error("Maximum concurrent generations reached");
}

export function assertSafeHttpUrl(value: string) {
  const url = new URL(value);
  if (!["http:", "https:"].includes(url.protocol))
    throw new Error("Only HTTP and HTTPS URLs are supported.");
  const hostname = url.hostname.toLowerCase();
  if (
    hostname === "localhost" ||
    hostname === "0.0.0.0" ||
    hostname === "::1" ||
    hostname.endsWith(".local") ||
    /^127\./.test(hostname) ||
    /^10\./.test(hostname) ||
    /^192\.168\./.test(hostname) ||
    /^169\.254\./.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(hostname)
  )
    throw new Error("Private network URLs are not allowed.");
  return url;
}

function isPrivateAddress(address: string) {
  const normalized = address.replace(/^::ffff:/, "");
  return (
    normalized === "::1" ||
    normalized === "0.0.0.0" ||
    /^127\./.test(normalized) ||
    /^10\./.test(normalized) ||
    /^192\.168\./.test(normalized) ||
    /^169\.254\./.test(normalized) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(normalized) ||
    /^fc/i.test(normalized) ||
    /^fd/i.test(normalized) ||
    /^fe[89ab]/i.test(normalized)
  );
}

export async function assertPublicHttpUrl(value: string) {
  const url = assertSafeHttpUrl(value);
  const addresses = isIP(url.hostname)
    ? [{ address: url.hostname }]
    : await lookup(url.hostname, { all: true, verbatim: true });
  if (
    !addresses.length ||
    addresses.some(({ address }) => isPrivateAddress(address))
  ) {
    throw new Error("Private network URLs are not allowed.");
  }
  return url;
}
