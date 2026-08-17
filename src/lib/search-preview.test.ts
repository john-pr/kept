import { describe, expect, it } from "vitest";
import { toSearchPreview } from "@/lib/search-preview";

describe("toSearchPreview", () => {
  it("returns short text unchanged", () => {
    expect(toSearchPreview("Hello world")).toBe("Hello world");
  });

  it("collapses newlines and repeated whitespace into single spaces", () => {
    expect(toSearchPreview("function foo() {\n  return 1;\n}\n\n")).toBe(
      "function foo() { return 1; }"
    );
  });

  it("trims leading and trailing whitespace", () => {
    expect(toSearchPreview("   padded text   ")).toBe("padded text");
  });

  it("truncates text longer than 200 characters and appends an ellipsis", () => {
    const longText = "a".repeat(250);
    const preview = toSearchPreview(longText);

    expect(preview).toHaveLength(201);
    expect(preview.endsWith("…")).toBe(true);
    expect(preview.startsWith("a".repeat(200))).toBe(true);
  });

  it("leaves text exactly at the limit untouched", () => {
    const exactText = "a".repeat(200);
    expect(toSearchPreview(exactText)).toBe(exactText);
  });

  it("returns an empty string for empty input", () => {
    expect(toSearchPreview("")).toBe("");
  });
});
