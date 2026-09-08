import { GET as getGeneration } from "@/app/api/generations/[id]/route";
import { developerApiResponse } from "@/lib/developer-api/response";

export async function GET(request: Request, context: RouteContext<"/api/v1/generations/[id]">) {
  return developerApiResponse(request, () => getGeneration(request, context));
}
