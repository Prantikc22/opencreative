import { describe, expect, it } from "vitest";
import { hasProductEntitlement, productEntitlements } from "@/lib/entitlements";

describe("product entitlements", () => {
  it("keeps creative plans out of Agent Studio", () => {
    expect(hasProductEntitlement({ plan: "pro" }, "creative")).toBe(true);
    expect(hasProductEntitlement({ plan: "pro" }, "agents")).toBe(false);
  });

  it("keeps agent plans out of Creative Studio", () => {
    expect(hasProductEntitlement({ plan: "agent-growth" }, "agents")).toBe(true);
    expect(hasProductEntitlement({ plan: "agent-growth" }, "creative")).toBe(false);
  });

  it("supports two independently purchased product families", () => {
    expect(productEntitlements({ product_entitlements: { creative: "creator", agents: "agent-launch" } })).toEqual({ creative: "creator", agents: "agent-launch" });
  });
});
