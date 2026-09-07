import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const MCP_SCOPE = "creative";
const CHATGPT_CLIENT_ID = "https://chatgpt.com/oauth/client.json";
const CHATGPT_REDIRECT = "https://chatgpt.com/connector_platform_oauth_redirect";

export function base64Url(bytes: Buffer) {
  return bytes.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function pkceChallenge(verifier: string) {
  return base64Url(createHash("sha256").update(verifier).digest());
}

export function randomToken(prefix: string) {
  return `${prefix}${base64Url(randomBytes(32))}`;
}

export function getMcpResource(request: Request) {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  return configured ? `${configured}/api/mcp` : new URL("/api/mcp", request.url).toString();
}

export function getMcpIssuer(request: Request) {
  const resource = new URL(getMcpResource(request));
  return resource.origin;
}

export function isAllowedRedirectUri(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol === "https:") return true;
    return url.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  } catch {
    return false;
  }
}

export function isBuiltInClient(clientId: string, redirectUri: string) {
  return clientId === CHATGPT_CLIENT_ID && redirectUri === CHATGPT_REDIRECT;
}

export async function registerClient(input: { clientName?: string; redirectUris: string[]; tokenEndpointAuthMethod?: string }) {
  if (!input.redirectUris.length || input.redirectUris.some((uri) => !isAllowedRedirectUri(uri))) throw new Error("Invalid redirect_uris");
  if (input.tokenEndpointAuthMethod && input.tokenEndpointAuthMethod !== "none") throw new Error("Only public PKCE clients are supported");
  const clientId = randomToken("oc_client_");
  const admin = createAdminClient();
  const { error } = await admin.from("mcp_oauth_clients").insert({
    client_id: clientId,
    client_name: input.clientName?.slice(0, 120) || "MCP client",
    redirect_uris: input.redirectUris,
    token_endpoint_auth_method: "none",
  });
  if (error) throw new Error("MCP OAuth database migration required");
  return { clientId, redirectUris: input.redirectUris };
}

export async function getRegisteredClient(clientId: string) {
  if (clientId === CHATGPT_CLIENT_ID) return null;
  const admin = createAdminClient();
  const { data } = await admin.from("mcp_oauth_clients").select("client_id,redirect_uris").eq("client_id", clientId).maybeSingle();
  return data as { client_id: string; redirect_uris: string[] } | null;
}

export async function issueAuthorizationCode(input: { clientId: string; userId: string; redirectUri: string; scope?: string; resource: string; codeChallenge: string }) {
  const code = randomToken("oc_code_");
  const admin = createAdminClient();
  const { error } = await admin.from("mcp_oauth_authorization_codes").insert({
    code_hash: sha256(code),
    client_id: input.clientId,
    user_id: input.userId,
    redirect_uri: input.redirectUri,
    scope: input.scope || MCP_SCOPE,
    resource: input.resource,
    code_challenge: input.codeChallenge,
    code_challenge_method: "S256",
    expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
  });
  if (error) throw new Error("MCP OAuth database migration required");
  return code;
}

export async function exchangeAuthorizationCode(input: { code: string; clientId: string; redirectUri: string; verifier: string; resource: string }) {
  const admin = createAdminClient();
  const { data: row, error } = await admin.from("mcp_oauth_authorization_codes").select("*").eq("code_hash", sha256(input.code)).maybeSingle();
  if (error || !row || row.used_at || row.client_id !== input.clientId || row.redirect_uri !== input.redirectUri || row.resource !== input.resource || new Date(row.expires_at).getTime() <= Date.now() || pkceChallenge(input.verifier) !== row.code_challenge) throw new Error("invalid_grant");
  const { error: usedError } = await admin.from("mcp_oauth_authorization_codes").update({ used_at: new Date().toISOString() }).eq("code_hash", row.code_hash).is("used_at", null);
  if (usedError) throw new Error("invalid_grant");
  const accessToken = randomToken("oc_mcp_");
  const expiresIn = 60 * 60;
  const { data: membership, error: membershipError } = await admin
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", row.user_id)
    .order("joined_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (membershipError || !membership?.workspace_id) {
    console.error("MCP OAuth workspace lookup failed", membershipError?.message || "No workspace membership");
    throw new Error("invalid_grant");
  }
  const { error: tokenError } = await admin.from("mcp_oauth_access_tokens").insert({
    token_hash: sha256(accessToken),
    client_id: input.clientId,
    user_id: row.user_id,
    workspace_id: membership.workspace_id,
    scope: row.scope,
    resource: row.resource,
    expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
  });
  if (tokenError) throw new Error("MCP OAuth database migration required");
  return { accessToken, expiresIn, scope: row.scope as string };
}

export async function validateMcpAccessToken(token: string, request: Request) {
  const admin = createAdminClient();
  const { data: row, error } = await admin.from("mcp_oauth_access_tokens").select("token_hash,user_id,workspace_id,scope,resource,expires_at").eq("token_hash", sha256(token)).is("revoked_at", null).maybeSingle();
  if (error || !row || new Date(row.expires_at).getTime() <= Date.now() || row.resource !== getMcpResource(request)) return null;
  await admin.from("mcp_oauth_access_tokens").update({ last_used_at: new Date().toISOString() }).eq("token_hash", row.token_hash);
  return row as { user_id: string; workspace_id: string; scope: string; resource: string; expires_at: string };
}

export async function getSignedInUser() {
  const supabase = await createClient();
  return (await supabase.auth.getUser()).data.user;
}
