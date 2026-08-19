import { describe, expect, it } from "vitest";
import { buildDescriptionInput, parseDescriptionResponse } from "./description";

describe("buildDescriptionInput", () => {
  it("always includes the title", () => {
    const input = buildDescriptionInput({
      title: "My Title",
      content: null,
      url: null,
      language: null,
      fileName: null,
    });
    expect(input).toContain("Title: My Title");
  });

  it("includes content when present", () => {
    const input = buildDescriptionInput({
      title: "Title",
      content: "some code",
      url: null,
      language: null,
      fileName: null,
    });
    expect(input).toContain("Content:\nsome code");
  });

  it("omits blank/whitespace-only content", () => {
    const input = buildDescriptionInput({
      title: "Title",
      content: "   ",
      url: null,
      language: null,
      fileName: null,
    });
    expect(input).not.toContain("Content:");
  });

  it("includes url, language, and fileName when present", () => {
    const input = buildDescriptionInput({
      title: "Title",
      content: null,
      url: "https://example.com",
      language: "typescript",
      fileName: "report.pdf",
    });
    expect(input).toContain("URL: https://example.com");
    expect(input).toContain("Language: typescript");
    expect(input).toContain("File name: report.pdf");
  });

  it("omits fields that are null", () => {
    const input = buildDescriptionInput({
      title: "Title",
      content: null,
      url: null,
      language: null,
      fileName: null,
    });
    expect(input).toBe("Title: Title");
  });

  it("truncates content to 2000 chars", () => {
    const longContent = "a".repeat(3000);
    const input = buildDescriptionInput({
      title: "Title",
      content: longContent,
      url: null,
      language: null,
      fileName: null,
    });
    const contentPart = input.split("Content:\n")[1];
    expect(contentPart.length).toBe(2000);
  });
});

describe("parseDescriptionResponse", () => {
  it("trims whitespace", () => {
    expect(parseDescriptionResponse("  A short summary.  ")).toBe("A short summary.");
  });

  it("strips surrounding quotes", () => {
    expect(parseDescriptionResponse('"A short summary."')).toBe("A short summary.");
  });

  it("caps length at 300 chars", () => {
    const long = "a".repeat(400);
    expect(parseDescriptionResponse(long).length).toBe(300);
  });

  it("returns an empty string for empty input", () => {
    expect(parseDescriptionResponse("   ")).toBe("");
  });
});
