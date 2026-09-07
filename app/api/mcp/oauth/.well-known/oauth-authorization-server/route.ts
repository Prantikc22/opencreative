import { NextResponse } from "next/server";
import { getMcpIssuer } from "@/lib/mcp/oauth";

export async function GET(request: Request) {
  const issuer = getMcpIssuer(request);
  return NextResponse.json({
    issuer,
    authorization_endpoint: `${issuer}/authorize`,
    token_endpoint: `${issuer}/token`,
    registration_endpoint: `${issuer}/register`,
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code"],
    code_challenge_methods_supported: ["S256"],
    token_endpoint_auth_methods_supported: ["none"],
    scopes_supported: ["creative"],
    client_id_metadata_document_supported: false,
  }, { headers: { "Cache-Control": "public, max-age=300" } });
}

export { GET as OPTIONS };
