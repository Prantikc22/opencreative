import { describe, expect, it } from "vitest";
import { supportedLanguages } from "@/lib/languages";

describe("supported languages", () => {
  it("keeps the shared product catalog at OpenRouter's 70+ language coverage", () => {
    expect(supportedLanguages.length).toBeGreaterThanOrEqual(70);
  });

  it("uses unique names and locale codes", () => {
    expect(new Set(supportedLanguages.map((item) => item.name)).size).toBe(supportedLanguages.length);
    expect(new Set(supportedLanguages.map((item) => item.code)).size).toBe(supportedLanguages.length);
  });
});
