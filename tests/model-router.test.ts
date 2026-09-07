import { describe,expect,it } from "vitest";
import { estimateCredits, routeModel, routeOperationModel } from "@/lib/models/registry";

describe("model router", () => {
  it("routes normal creators to a curated standard model", () => {
    expect(routeModel("image", "standard")?.capability).toBe("image");
    expect(routeModel("video", "standard")?.qualityTier).toBe("standard");
  });

  it("routes specialized operations to purpose-built live models", () => {
    expect(routeOperationModel("video", "edit-video")?.id).toBe("runway/aleph-2");
    expect(routeOperationModel("video", "upscale-video")?.id).toBe("black-forest-labs/flux-video-upscale");
    expect(routeOperationModel("video", "extend-video")?.id).toBe("bytedance/seedance-2.5");
    expect(routeOperationModel("image", "remove-background")?.id).toBe("openai/gpt-image-1-mini");
    expect(routeOperationModel("avatar", "lip-sync")?.id).toBe("heygen/avatar-iv");
  });

  it("scales video credits with duration and resolution", () => {
    const model = routeModel("video", "standard")!;
    expect(estimateCredits(model, { duration: 10, resolution: "720p" })).toBe(model.creditBase * 2);
    expect(estimateCredits(model, { duration: 5, resolution: "1080p" })).toBeGreaterThan(model.creditBase);
  });

  it("caps image output multiplier", () => {
    const model = routeModel("image", "fast")!;
    expect(estimateCredits(model, { count: 99 })).toBe(model.creditBase * 4);
  });
});
