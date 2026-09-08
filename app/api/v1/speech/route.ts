import { POST as createSpeech } from "@/app/api/generate/speech/route";
import { developerApiResponse } from "@/lib/developer-api/response";

export const maxDuration = 60;
export async function POST(request: Request) {
  return developerApiResponse(request, () => createSpeech(request));
}
