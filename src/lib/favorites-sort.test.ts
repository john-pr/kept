import { describe, expect, it } from "vitest";
import { sortFavoriteItems, sortFavoriteCollections } from "./favorites-sort";
import type { FavoriteItem } from "@/lib/db/items";
import type { FavoriteCollection } from "@/lib/db/collections";

function makeItem(
  id: string,
  title: string,
  typeName: string,
  updatedAt: string,
): FavoriteItem {
  return {
    id,
    title,
    typeName,
    typeIcon: "File",
    typeColor: "#000000",
    updatedAt: new Date(updatedAt),
  };
}

function makeCollection(id: string, name: string, updatedAt: string): FavoriteCollection {
  return { id, name, itemCount: 0, updatedAt: new Date(updatedAt) };
}

describe("sortFavoriteItems", () => {
  const items = [
    makeItem("1", "Charlie", "Note", "2026-01-02"),
    makeItem("2", "alpha", "Snippet", "2026-01-03"),
    makeItem("3", "Bravo", "Link", "2026-01-01"),
  ];

  it("sorts newest first by updatedAt", () => {
    expect(sortFavoriteItems(items, "newest").map((i) => i.id)).toEqual(["2", "1", "3"]);
  });

  it("sorts oldest first by updatedAt", () => {
    expect(sortFavoriteItems(items, "oldest").map((i) => i.id)).toEqual(["3", "1", "2"]);
  });

  it("sorts by title A-Z, case-insensitively", () => {
    expect(sortFavoriteItems(items, "name-asc").map((i) => i.id)).toEqual(["2", "3", "1"]);
  });

  it("sorts by title Z-A", () => {
    expect(sortFavoriteItems(items, "name-desc").map((i) => i.id)).toEqual(["1", "3", "2"]);
  });

  it("sorts by item type name", () => {
    expect(sortFavoriteItems(items, "type").map((i) => i.id)).toEqual(["3", "1", "2"]);
  });

  it("does not mutate the input array", () => {
    const original = [...items];
    sortFavoriteItems(items, "name-asc");
    expect(items).toEqual(original);
  });
});

describe("sortFavoriteCollections", () => {
  const collections = [
    makeCollection("1", "Charlie", "2026-01-02"),
    makeCollection("2", "alpha", "2026-01-03"),
    makeCollection("3", "Bravo", "2026-01-01"),
  ];

  it("sorts newest first by updatedAt", () => {
    expect(sortFavoriteCollections(collections, "newest").map((c) => c.id)).toEqual([
      "2",
      "1",
      "3",
    ]);
  });

  it("sorts oldest first by updatedAt", () => {
    expect(sortFavoriteCollections(collections, "oldest").map((c) => c.id)).toEqual([
      "3",
      "1",
      "2",
    ]);
  });

  it("sorts by name A-Z", () => {
    expect(sortFavoriteCollections(collections, "name-asc").map((c) => c.id)).toEqual([
      "2",
      "3",
      "1",
    ]);
  });

  it("sorts by name Z-A", () => {
    expect(sortFavoriteCollections(collections, "name-desc").map((c) => c.id)).toEqual([
      "1",
      "3",
      "2",
    ]);
  });

  it("falls back to sorting by name when 'type' is selected (collections have no item type)", () => {
    expect(sortFavoriteCollections(collections, "type").map((c) => c.id)).toEqual([
      "2",
      "3",
      "1",
    ]);
  });
});
