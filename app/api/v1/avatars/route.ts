import { POST as createAvatar } from "@/app/api/generate/avatar/route";
import { developerApiResponse } from "@/lib/developer-api/response";

export const maxDuration = 60;
export async function POST(request: Request) {
  return developerApiResponse(request, () => createAvatar(request));
}
