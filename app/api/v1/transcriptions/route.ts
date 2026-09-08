import { POST as createTranscription } from "@/app/api/generate/transcribe/route";
import { developerApiResponse } from "@/lib/developer-api/response";

export const maxDuration = 60;
export async function POST(request: Request) {
  return developerApiResponse(request, () => createTranscription(request));
}
