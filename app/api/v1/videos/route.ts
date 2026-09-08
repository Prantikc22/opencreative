import { POST as createVideo } from "@/app/api/generate/video/route";
import { developerApiResponse } from "@/lib/developer-api/response";

export const maxDuration = 60;
export async function POST(request: Request) {
  return developerApiResponse(request, () => createVideo(request));
}
