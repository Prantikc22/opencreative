import { POST as createMusic } from "@/app/api/generate/music/route";
import { developerApiResponse } from "@/lib/developer-api/response";

export const maxDuration = 120;
export async function POST(request: Request) {
  return developerApiResponse(request, () => createMusic(request));
}
