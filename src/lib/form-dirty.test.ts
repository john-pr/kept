import { describe, expect, it } from "vitest";
import { isFormDirty } from "./form-dirty";

describe("isFormDirty", () => {
  const initial = { title: "", tags: "", file: null as { name: string } | null, ids: [] as string[] };

  it("is pristine when nothing changed", () => {
    expect(isFormDirty(initial, { ...initial })).toBe(false);
  });

  it("treats whitespace-only edits as pristine", () => {
    expect(isFormDirty(initial, { ...initial, title: "   ", tags: "\n" })).toBe(false);
  });

  it("is dirty when a string field has real content", () => {
    expect(isFormDirty(initial, { ...initial, title: "Hello" })).toBe(true);
  });

  it("ignores surrounding whitespace against a non-empty initial value", () => {
    expect(isFormDirty({ title: "Saved" }, { title: " Saved " })).toBe(false);
    expect(isFormDirty({ title: "Saved" }, { title: "Saved!" })).toBe(true);
  });

  it("is dirty when a nullable value is set", () => {
    expect(isFormDirty(initial, { ...initial, file: { name: "a.png" } })).toBe(true);
  });

  it("compares arrays as unordered sets", () => {
    const withIds = { ...initial, ids: ["a", "b"] };
    expect(isFormDirty(withIds, { ...withIds, ids: ["b", "a"] })).toBe(false);
    expect(isFormDirty(withIds, { ...withIds, ids: ["a"] })).toBe(true);
    expect(isFormDirty(withIds, { ...withIds, ids: ["a", "c"] })).toBe(true);
  });
});
