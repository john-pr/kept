import { describe, expect, it } from "vitest";
import { buildOptimizePromptInput, parseOptimizePromptResponse } from "./optimize-prompt";

describe("buildOptimizePromptInput", () => {
  it("includes the title and prompt content", () => {
    const input = buildOptimizePromptInput({ title: "My Prompt", content: "Write a poem." });
    expect(input).toContain("Title: My Prompt");
    expect(input).toContain("Prompt:\nWrite a poem.");
  });

  it("truncates content to 2000 chars", () => {
    const longContent = "a".repeat(3000);
    const input = buildOptimizePromptInput({ title: "Title", content: longContent });
    const promptPart = input.split("Prompt:\n")[1];
    expect(promptPart.length).toBe(2000);
  });
});

describe("parseOptimizePromptResponse", () => {
  it("trims whitespace", () => {
    expect(parseOptimizePromptResponse("  Refined prompt text.  ")).toBe("Refined prompt text.");
  });

  it("strips surrounding quotes", () => {
    expect(parseOptimizePromptResponse('"Refined prompt text."')).toBe("Refined prompt text.");
  });

  it("returns an empty string for empty input", () => {
    expect(parseOptimizePromptResponse("   ")).toBe("");
  });
});
