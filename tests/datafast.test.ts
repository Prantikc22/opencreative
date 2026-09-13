import { describe, expect, it } from "vitest";
import { dataFastCheckoutMetadata } from "@/lib/datafast";

describe("DataFast checkout attribution", () => {
  it("passes available visitor and session identifiers to checkout metadata", () => {
    expect(dataFastCheckoutMetadata({ visitorId: "visitor-123", sessionId: "session-456" })).toEqual({
      datafast_visitor_id: "visitor-123",
      datafast_session_id: "session-456",
    });
  });

  it("does not add empty or unreasonably long cookie values", () => {
    expect(dataFastCheckoutMetadata({ visitorId: " ", sessionId: "x".repeat(201) })).toEqual({});
  });
});
