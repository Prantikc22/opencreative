import { describe,expect,it } from "vitest";
import { cleanFileName } from "@/lib/utils";
describe("file name sanitizer",()=>{it("removes path and shell characters",()=>{expect(cleanFileName("../../my product;$(x).png")).toBe("my-product-x-.png")});it("creates a safe fallback",()=>{expect(cleanFileName("🔥")).toBe("asset")})});
