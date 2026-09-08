import "server-only";
import { randomUUID } from "node:crypto";

export async function developerApiResponse(
  request: Request,
  handler: () => Promise<Response>,
) {
  const response = await handler();
  const headers = new Headers(response.headers);
  headers.set("OpenCreative-Version", "2026-09-08");
  headers.set("X-Request-Id", request.headers.get("x-request-id") || randomUUID());
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
