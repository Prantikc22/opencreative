import { NextResponse } from "next/server";
import { getSignedInUser, getMcpResource, getRegisteredClient, isBuiltInClient, issueAuthorizationCode, MCP_SCOPE } from "@/lib/mcp/oauth";

function loginRedirect(request: Request) {
  const next = new URL(request.url);
  return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(`${next.pathname}${next.search}`)}`, next.origin));
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const clientId = url.searchParams.get("client_id") || "";
  const redirectUri = url.searchParams.get("redirect_uri") || "";
  const responseType = url.searchParams.get("response_type");
  const codeChallenge = url.searchParams.get("code_challenge") || "";
  const method = url.searchParams.get("code_challenge_method");
  const resource = url.searchParams.get("resource");
  const scope = url.searchParams.get("scope") || MCP_SCOPE;
  const state = url.searchParams.get("state");
  const client = clientId ? await getRegisteredClient(clientId) : null;
  const redirectAllowed = isBuiltInClient(clientId, redirectUri) || Boolean(client?.redirect_uris.includes(redirectUri));
  if (!clientId || !redirectAllowed || responseType !== "code" || !codeChallenge || method !== "S256" || !scope.split(/\s+/).includes(MCP_SCOPE) || (resource && resource !== getMcpResource(request))) return NextResponse.json({ error: "invalid_request", error_description: "Use a registered HTTPS redirect URI and PKCE S256." }, { status: 400 });
  const user = await getSignedInUser();
  if (!user) return loginRedirect(request);
  try {
    const code = await issueAuthorizationCode({ clientId, userId: user.id, redirectUri, scope: MCP_SCOPE, resource: getMcpResource(request), codeChallenge });
    const destination = new URL(redirectUri);
    destination.searchParams.set("code", code);
    if (state) destination.searchParams.set("state", state);
    return NextResponse.redirect(destination);
  } catch (cause) {
    return NextResponse.json({ error: "server_error", error_description: cause instanceof Error ? cause.message : "Could not issue authorization code." }, { status: 503 });
  }
}
