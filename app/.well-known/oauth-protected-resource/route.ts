import { NextResponse } from "next/server";
import { getMcpIssuer, getMcpResource } from "@/lib/mcp/oauth";

export async function GET(request: Request) {
  const resource = getMcpResource(request);
  const origin = new URL(resource).origin;
  return NextResponse.json({
    resource,
    authorization_servers: [getMcpIssuer(request)],
    scopes_supported: ["creative"],
    bearer_methods_supported: ["header"],
    resource_documentation: `${origin}/mcp`,
  }, { headers: { "Cache-Control": "public, max-age=300" } });
}
