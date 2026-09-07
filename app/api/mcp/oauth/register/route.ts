import { NextResponse } from "next/server";
import { registerClient } from "@/lib/mcp/oauth";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { client_name?: string; redirect_uris?: unknown; token_endpoint_auth_method?: string };
    const redirectUris = Array.isArray(body.redirect_uris) ? body.redirect_uris.filter((uri): uri is string => typeof uri === "string") : [];
    const client = await registerClient({ clientName: body.client_name, redirectUris, tokenEndpointAuthMethod: body.token_endpoint_auth_method });
    return NextResponse.json({
      client_id: client.clientId,
      client_name: body.client_name || "MCP client",
      redirect_uris: client.redirectUris,
      token_endpoint_auth_method: "none",
      grant_types: ["authorization_code"],
      response_types: ["code"],
      client_secret_expires_at: 0,
    }, { status: 201 });
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "invalid_client_metadata";
    return NextResponse.json({ error: message === "MCP OAuth database migration required" ? "server_error" : "invalid_client_metadata", error_description: message }, { status: message === "MCP OAuth database migration required" ? 503 : 400 });
  }
}
