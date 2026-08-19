import { describe, expect, it } from "vitest";
import { buildExplainInput, parseExplainResponse } from "./explain";

describe("buildExplainInput", () => {
  it("always includes the title and code", () => {
    const input = buildExplainInput({ title: "My Title", content: "const x = 1;", language: null });
    expect(input).toContain("Title: My Title");
    expect(input).toContain("Code:\nconst x = 1;");
  });

  it("includes language when present", () => {
    const input = buildExplainInput({ title: "Title", content: "code", language: "typescript" });
    expect(input).toContain("Language: typescript");
  });

  it("omits language when null", () => {
    const input = buildExplainInput({ title: "Title", content: "code", language: null });
    expect(input).not.toContain("Language:");
  });

  it("truncates content to 2000 chars", () => {
    const longContent = "a".repeat(3000);
    const input = buildExplainInput({ title: "Title", content: longContent, language: null });
    const codePart = input.split("Code:\n")[1];
    expect(codePart.length).toBe(2000);
  });
});

describe("parseExplainResponse", () => {
  it("trims whitespace", () => {
    expect(parseExplainResponse("  ## Explanation\n\nDoes stuff.  ")).toBe(
      "## Explanation\n\nDoes stuff."
    );
  });

  it("returns an empty string for empty input", () => {
    expect(parseExplainResponse("   ")).toBe("");
  });
});
