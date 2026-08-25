import { describe, expect, it } from "vitest";
import { pluralize, singularize } from "./text";

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

describe("pluralize", () => {
  it("keeps the noun singular for a count of 1", () => {
    expect(pluralize(1, "collection")).toBe("1 collection");
  });

  it("pluralizes for counts other than 1", () => {
    expect(pluralize(0, "collection")).toBe("0 collections");
    expect(pluralize(5, "item")).toBe("5 items");
    expect(pluralize(-1, "item")).toBe("-1 items");
  });
});
