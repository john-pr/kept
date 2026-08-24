import { describe, expect, it } from "vitest";
import { appendTagToInput, parseTagsInput } from "./tags";

describe("parseTagsInput", () => {
  it("returns an empty array for an empty string", () => {
    expect(parseTagsInput("")).toEqual([]);
  });

  it("returns an empty array for a whitespace-only string", () => {
    expect(parseTagsInput("   ")).toEqual([]);
  });

  it("splits and trims comma-separated tags", () => {
    expect(parseTagsInput("react,  hooks ,typescript")).toEqual(["react", "hooks", "typescript"]);
  });

  it("filters out empty entries from trailing/leading/double commas", () => {
    expect(parseTagsInput(",react,, hooks,")).toEqual(["react", "hooks"]);
  });
});

describe("appendTagToInput", () => {
  it("appends a tag to an empty input", () => {
    expect(appendTagToInput("", "react")).toBe("react");
  });

  it("appends a tag to existing tags, rejoined with ', '", () => {
    expect(appendTagToInput("react, hooks", "typescript")).toBe("react, hooks, typescript");
  });

  it("normalizes existing whitespace/empty entries when rejoining", () => {
    expect(appendTagToInput(" react ,, hooks ", "typescript")).toBe("react, hooks, typescript");
  });
});
