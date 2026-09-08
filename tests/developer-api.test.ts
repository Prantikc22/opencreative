import { describe, expect, it } from "vitest";
import { openCreativeOpenApi } from "@/lib/developer-api/openapi";

describe("developer API contract", () => {
  it("publishes every production media endpoint", () => {
    const paths = Object.keys(openCreativeOpenApi().paths);
    expect(paths).toEqual(expect.arrayContaining([
      "/api/v1/images",
      "/api/v1/videos",
      "/api/v1/speech",
      "/api/v1/music",
      "/api/v1/avatars",
      "/api/v1/transcriptions",
      "/api/v1/generations/{id}",
      "/api/v1/models",
      "/api/v1/credits",
    ]));
  });

  it("requires bearer authentication and documents credit errors", () => {
    const document = openCreativeOpenApi();
    expect(document.components.securitySchemes.bearerAuth).toMatchObject({
      type: "http",
      scheme: "bearer",
    });
    expect(document.paths["/api/v1/images"].post.responses).toHaveProperty("402");
  });
});
