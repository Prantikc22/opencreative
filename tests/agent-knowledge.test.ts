import { describe, expect, it } from "vitest";
import { agentKnowledge, readAgentResources } from "@/lib/agents/knowledge";

const resource = {
  id: "f20a21cb-95a4-48bb-b4f9-df62fb56189c",
  name: "Help center",
  type: "website" as const,
  source: "https://example.com/help",
  text: "Returns are accepted for 30 days.",
};

describe("agent knowledge resources", () => {
  it("adds approved resources to manual knowledge", () => {
    expect(agentKnowledge("OpenCreative product facts.", { resources: [resource] }))
      .toContain("Returns are accepted for 30 days.");
  });

  it("ignores malformed resource settings", () => {
    expect(readAgentResources({ resources: [{ name: "Missing fields" }] })).toEqual([]);
    expect(agentKnowledge("Manual knowledge", null)).toBe("Manual knowledge");
  });
});
