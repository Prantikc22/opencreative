import { NextResponse } from "next/server";
import { z } from "zod";
import { apiContext, apiError } from "@/lib/api/context";
import { creativeJson } from "@/lib/openrouter/client";
const schema = z.object({
  text: z.string().min(1).max(15000),
  language: z.string().min(2).max(60),
  tone: z.string().max(80).optional(),
});
const output = {
  type: "object",
  additionalProperties: false,
  properties: {
    translation: { type: "string" },
    language: { type: "string" },
    notes: { type: "string" },
  },
  required: ["translation", "language", "notes"],
};
export async function POST(request: Request) {
  try {
    await apiContext("creative");
    const input = schema.parse(await request.json());
    const result = await creativeJson<{
      translation: string;
      language: string;
      notes: string;
    }>({
      system:
        "Translate creator copy faithfully. Preserve meaning, brand names, pacing, and tone. Do not add claims. Return only the requested structured translation.",
      prompt: `Target language: ${input.language}\nTone: ${input.tone || "natural"}\nText:\n${input.text}`,
      schemaName: "translation",
      schema: output,
    });
    return NextResponse.json(result);
  } catch (cause) {
    const error = apiError(cause);
    return NextResponse.json(
      { error: error.message },
      { status: cause instanceof z.ZodError ? 400 : error.status },
    );
  }
}
