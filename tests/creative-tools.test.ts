import { describe, expect, it } from "vitest";
import {
  creativeTools,
  getCreativeTool,
  type CreativeToolCategory,
} from "@/lib/creative-tools";

describe("creative toolbox", () => {
  it("uses unique stable ids and internal destinations", () => {
    const ids = creativeTools.map((tool) => tool.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(creativeTools.every((tool) => tool.href.startsWith("/"))).toBe(true);
  });

  it("covers every toolbox category", () => {
    const categories: CreativeToolCategory[] = [
      "Video",
      "Image",
      "Audio",
      "World",
      "Characters",
    ];
    for (const category of categories) {
      expect(creativeTools.some((tool) => tool.category === category)).toBe(true);
    }
  });

  it("configures prompt-driven studio presets", () => {
    const promptTools = creativeTools.filter((tool) => tool.href.includes("?tool="));
    expect(promptTools.length).toBeGreaterThan(15);
    expect(promptTools.every((tool) => tool.mode && tool.promptPrefix)).toBe(true);
    expect(getCreativeTool("frame-to-video")?.mode).toBe("video");
    expect(getCreativeTool("edit-image")?.mode).toBe("image");
  });
});
