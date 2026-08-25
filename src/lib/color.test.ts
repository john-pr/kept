import { describe, expect, it } from "vitest";
import { withAlpha } from "./color";

describe("withAlpha", () => {
  it("appends the default dark-mode alpha suffix to a 6-digit hex color", () => {
    expect(withAlpha("#3b82f6")).toBe("#3b82f62E");
  });

  it("appends a custom alpha suffix when provided", () => {
    expect(withAlpha("#3b82f6", "1F")).toBe("#3b82f61F");
  });

  it("returns the value unchanged when it isn't a plain 6-digit hex color", () => {
    expect(withAlpha("#fff")).toBe("#fff");
    expect(withAlpha("rgba(59, 130, 246, 0.5)")).toBe("rgba(59, 130, 246, 0.5)");
    expect(withAlpha("not-a-color")).toBe("not-a-color");
  });
});
