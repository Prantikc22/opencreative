import { NextResponse } from "next/server";
import { exchangeAuthorizationCode, getMcpResource } from "@/lib/mcp/oauth";

export async function POST(request: Request) {
  let body: URLSearchParams;
  try {
    const text = await request.text();
    body = new URLSearchParams(text);
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
  if (body.get("grant_type") !== "authorization_code") return NextResponse.json({ error: "unsupported_grant_type" }, { status: 400 });
  try {
    const result = await exchangeAuthorizationCode({
      code: body.get("code") || "",
      clientId: body.get("client_id") || "",
      redirectUri: body.get("redirect_uri") || "",
      verifier: body.get("code_verifier") || "",
      resource: body.get("resource") || getMcpResource(request),
    });
    return NextResponse.json(
      { access_token: result.accessToken, token_type: "Bearer", expires_in: result.expiresIn, scope: result.scope },
      { headers: { "Cache-Control": "no-store", Pragma: "no-cache" } },
    );
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "invalid_grant";
    console.error("MCP OAuth token exchange failed", message);
    return NextResponse.json({ error: message === "MCP OAuth database migration required" ? "server_error" : "invalid_grant", error_description: message }, { status: message === "MCP OAuth database migration required" ? 503 : 400 });
  }
}
