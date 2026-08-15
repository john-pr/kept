import { describe, expect, it } from "vitest";
import { groupItemsByType } from "./item-grouping";
import type { ItemSummary } from "@/lib/db/items";

function makeItem(id: string, typeName: string): ItemSummary {
  return {
    id,
    title: id,
    content: "",
    tags: [],
    isFavorite: false,
    isPinned: false,
    typeName,
    typeIcon: "File",
    typeColor: "#000000",
    fileUrl: null,
    fileName: null,
    fileSize: null,
    createdAt: new Date(),
  };
}

describe("groupItemsByType", () => {
  it("buckets items by type into images, files, and other", () => {
    const items = [
      makeItem("1", "Snippet"),
      makeItem("2", "Image"),
      makeItem("3", "File"),
      makeItem("4", "Link"),
    ];

    const { imageItems, fileItems, otherItems } = groupItemsByType(items);

    expect(imageItems.map((i) => i.id)).toEqual(["2"]);
    expect(fileItems.map((i) => i.id)).toEqual(["3"]);
    expect(otherItems.map((i) => i.id)).toEqual(["1", "4"]);
  });

  it("matches type names case-insensitively", () => {
    const items = [makeItem("1", "image"), makeItem("2", "IMAGE"), makeItem("3", "file")];

    const { imageItems, fileItems } = groupItemsByType(items);

    expect(imageItems.map((i) => i.id)).toEqual(["1", "2"]);
    expect(fileItems.map((i) => i.id)).toEqual(["3"]);
  });

  it("preserves input order within each bucket", () => {
    const items = [makeItem("1", "Note"), makeItem("2", "Prompt"), makeItem("3", "Command")];

    const { otherItems } = groupItemsByType(items);

    expect(otherItems.map((i) => i.id)).toEqual(["1", "2", "3"]);
  });

  it("returns empty buckets for an empty list", () => {
    expect(groupItemsByType([])).toEqual({ imageItems: [], fileItems: [], otherItems: [] });
  });
});
