import { POST as createImage } from "@/app/api/generate/image/route";
import { developerApiResponse } from "@/lib/developer-api/response";

export const maxDuration = 60;
export async function POST(request: Request) {
  return developerApiResponse(request, () => createImage(request));
}
