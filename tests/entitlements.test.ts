import { describe, expect, it } from "vitest";
import { hasProductEntitlement, productEntitlements } from "@/lib/entitlements";

describe("product entitlements", () => {
  it("gives creative plans the free Agent Sandbox", () => {
    expect(hasProductEntitlement({ plan: "pro" }, "creative")).toBe(true);
    expect(productEntitlements({ plan: "pro" })).toEqual({ creative: "pro", agents: "agent-sandbox" });
  });

  it("gives agent plans the free Creative Studio", () => {
    expect(hasProductEntitlement({ plan: "agent-growth" }, "agents")).toBe(true);
    expect(productEntitlements({ plan: "agent-growth" })).toEqual({ creative: "free", agents: "agent-growth" });
  });

  it("supports two independently purchased product families", () => {
    expect(productEntitlements({ product_entitlements: { creative: "creator", agents: "agent-launch" } })).toEqual({ creative: "creator", agents: "agent-launch" });
  });

  it("repairs stale null entitlements from the active paid plan", () => {
    expect(productEntitlements({ plan: "creator", product_entitlements: { creative: null } })).toEqual({
      creative: "creator",
      agents: "agent-sandbox",
    });
  });
});
