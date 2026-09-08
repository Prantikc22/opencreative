import { GET as getCredits } from "@/app/api/credits/balance/route";
import { developerApiResponse } from "@/lib/developer-api/response";

export async function GET(request: Request) {
  return developerApiResponse(request, () => getCredits(request));
}
