import { describe, expect, it } from "vitest";
import { singularize } from "./text";

describe("singularize", () => {
  it("drops a trailing 's'", () => {
    expect(singularize("Snippets")).toBe("Snippet");
  });

  it("leaves a name with no trailing 's' unchanged", () => {
    expect(singularize("Notes")).toBe("Note");
    expect(singularize("Prompt")).toBe("Prompt");
  });

  it("returns an empty string unchanged", () => {
    expect(singularize("")).toBe("");
  });
});
