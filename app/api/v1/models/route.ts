import { GET as listModels } from "@/app/api/models/route";
import { developerApiResponse } from "@/lib/developer-api/response";

export async function GET(request: Request) {
  return developerApiResponse(request, () => listModels(request));
}
