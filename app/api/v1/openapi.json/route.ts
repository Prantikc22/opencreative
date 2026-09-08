import { openCreativeOpenApi } from "@/lib/developer-api/openapi";

export const dynamic = "force-static";

export function GET() {
  return Response.json(openCreativeOpenApi(), {
    headers: { "Cache-Control": "public, max-age=3600" },
  });
}
