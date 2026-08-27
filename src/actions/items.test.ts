import { describe, expect, it, vi, beforeEach } from "vitest";
import { createItem, deleteItem, toggleItemFavorite, toggleItemPin, updateItem } from "./items";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db/items", () => ({
  getItemOwnerId: vi.fn(),
  getItemForDeletion: vi.fn(),
  updateItem: vi.fn(),
  createItem: vi.fn(),
  deleteItem: vi.fn(),
  setItemFavorite: vi.fn(),
  setItemPin: vi.fn(),
  getItemTypeById: vi.fn(),
  getItemCountForUser: vi.fn(),
}));

vi.mock("@/lib/r2", () => ({
  deleteFromR2: vi.fn(),
  getKeyFromPublicUrl: vi.fn(),
}));

vi.mock("@/lib/db/collections", () => ({
  getCollectionOptions: vi.fn(),
}));

import { auth } from "@/auth";
import {
  createItem as createItemQuery,
  deleteItem as deleteItemQuery,
  getItemCountForUser,
  getItemForDeletion,
  getItemOwnerId,
  getItemTypeById,
  setItemFavorite,
  setItemPin,
  updateItem as updateItemQuery,
} from "@/lib/db/items";
import { getCollectionOptions } from "@/lib/db/collections";
import { deleteFromR2, getKeyFromPublicUrl } from "@/lib/r2";

const validPayload = {
  title: "Updated title",
  description: null,
  content: null,
  url: null,
  language: null,
  tags: [] as string[],
  collectionIds: [] as string[],
};

describe("updateItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects an empty title before touching the database", async () => {
    const result = await updateItem("item-1", { ...validPayload, title: "  " });

    expect(result).toEqual({ success: false, error: "Title is required" });
    expect(auth).not.toHaveBeenCalled();
  });

  it("rejects an invalid url", async () => {
    const result = await updateItem("item-1", { ...validPayload, url: "not-a-url" });

    expect(result.success).toBe(false);
    expect(auth).not.toHaveBeenCalled();
  });

  it("returns an error when there is no session", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);

    const result = await updateItem("item-1", validPayload);

    expect(result).toEqual({ success: false, error: "Not authenticated" });
    expect(getItemOwnerId).not.toHaveBeenCalled();
  });

  it("returns an error when the item does not exist", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as never);
    vi.mocked(getItemOwnerId).mockResolvedValue(null);

    const result = await updateItem("item-1", validPayload);

    expect(result).toEqual({ success: false, error: "Item not found" });
    expect(updateItemQuery).not.toHaveBeenCalled();
  });

  it("returns an error when the session user does not own the item", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as never);
    vi.mocked(getItemOwnerId).mockResolvedValue("someone-else");

    const result = await updateItem("item-1", validPayload);

    expect(result).toEqual({ success: false, error: "Not authorized to edit this item" });
    expect(updateItemQuery).not.toHaveBeenCalled();
  });

  it("updates the item when validation, auth, and ownership all pass", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as never);
    vi.mocked(getItemOwnerId).mockResolvedValue("user-1");
    const updated = { id: "item-1", title: "Updated title" };
    vi.mocked(updateItemQuery).mockResolvedValue(updated as never);

    const result = await updateItem("item-1", validPayload);

    expect(getCollectionOptions).not.toHaveBeenCalled();
    expect(updateItemQuery).toHaveBeenCalledWith("item-1", validPayload);
    expect(result).toEqual({ success: true, data: updated });
  });

  it("drops collection ids the session user does not own", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as never);
    vi.mocked(getItemOwnerId).mockResolvedValue("user-1");
    vi.mocked(getCollectionOptions).mockResolvedValue([{ id: "col-1", name: "Owned" }]);
    const updated = { id: "item-1", title: "Updated title" };
    vi.mocked(updateItemQuery).mockResolvedValue(updated as never);

    const result = await updateItem("item-1", {
      ...validPayload,
      collectionIds: ["col-1", "not-owned"],
    });

    expect(getCollectionOptions).toHaveBeenCalledWith("user-1");
    expect(updateItemQuery).toHaveBeenCalledWith("item-1", {
      ...validPayload,
      collectionIds: ["col-1"],
    });
    expect(result).toEqual({ success: true, data: updated });
  });
});

const validCreatePayload = {
  itemTypeId: "type-1",
  title: "New title",
  description: null,
  content: null,
  url: null,
  language: null,
  fileUrl: null,
  fileName: null,
  fileSize: null,
  tags: [] as string[],
  collectionIds: [] as string[],
};

describe("createItem", () => {
  const originalPlanGating = process.env.PLAN_GATING_ENABLED;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.PLAN_GATING_ENABLED = originalPlanGating;
  });

  it("rejects an empty title before touching the database", async () => {
    const result = await createItem({ ...validCreatePayload, title: "  " });

    expect(result).toEqual({ success: false, error: "Title is required" });
    expect(auth).not.toHaveBeenCalled();
  });

  it("returns an error when there is no session", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);

    const result = await createItem(validCreatePayload);

    expect(result).toEqual({ success: false, error: "Not authenticated" });
    expect(getItemTypeById).not.toHaveBeenCalled();
  });

  it("returns an error when the item type does not exist", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as never);
    vi.mocked(getItemTypeById).mockResolvedValue(null);

    const result = await createItem(validCreatePayload);

    expect(result).toEqual({ success: false, error: "Invalid item type" });
    expect(createItemQuery).not.toHaveBeenCalled();
  });

  it("returns an error when creating a link item without a url", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as never);
    vi.mocked(getItemTypeById).mockResolvedValue({ id: "type-1", name: "Link" });

    const result = await createItem(validCreatePayload);

    expect(result).toEqual({ success: false, error: "URL is required for link items" });
    expect(createItemQuery).not.toHaveBeenCalled();
  });

  it("returns an error when creating a file item without a file upload", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as never);
    vi.mocked(getItemTypeById).mockResolvedValue({ id: "type-1", name: "File" });

    const result = await createItem(validCreatePayload);

    expect(result).toEqual({ success: false, error: "A file upload is required" });
    expect(createItemQuery).not.toHaveBeenCalled();
  });

  it("creates the item when validation, auth, and item type all pass", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as never);
    vi.mocked(getItemTypeById).mockResolvedValue({ id: "type-1", name: "Snippet" });
    const created = { id: "item-1", title: "New title" };
    vi.mocked(createItemQuery).mockResolvedValue(created as never);

    const result = await createItem(validCreatePayload);

    expect(getCollectionOptions).not.toHaveBeenCalled();
    expect(createItemQuery).toHaveBeenCalledWith({ ...validCreatePayload, userId: "user-1" });
    expect(result).toEqual({ success: true, data: created });
  });

  it("drops collection ids the session user does not own", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as never);
    vi.mocked(getItemTypeById).mockResolvedValue({ id: "type-1", name: "Snippet" });
    vi.mocked(getCollectionOptions).mockResolvedValue([{ id: "col-1", name: "Owned" }]);
    const created = { id: "item-1", title: "New title" };
    vi.mocked(createItemQuery).mockResolvedValue(created as never);

    const result = await createItem({
      ...validCreatePayload,
      collectionIds: ["col-1", "not-owned"],
    });

    expect(getCollectionOptions).toHaveBeenCalledWith("user-1");
    expect(createItemQuery).toHaveBeenCalledWith({
      ...validCreatePayload,
      collectionIds: ["col-1"],
      userId: "user-1",
    });
    expect(result).toEqual({ success: true, data: created });
  });

  it("ignores gating limits when the flag is disabled, even over the free item limit", async () => {
    process.env.PLAN_GATING_ENABLED = "false";
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1", isPro: false } } as never);
    vi.mocked(getItemTypeById).mockResolvedValue({ id: "type-1", name: "Snippet" });
    const created = { id: "item-1", title: "New title" };
    vi.mocked(createItemQuery).mockResolvedValue(created as never);

    const result = await createItem(validCreatePayload);

    expect(getItemCountForUser).not.toHaveBeenCalled();
    expect(result).toEqual({ success: true, data: created });
  });

  it("rejects a Pro-only type for a non-Pro user when gating is enabled", async () => {
    process.env.PLAN_GATING_ENABLED = "true";
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1", isPro: false } } as never);
    vi.mocked(getItemTypeById).mockResolvedValue({ id: "type-1", name: "File" });

    const result = await createItem({ ...validCreatePayload, fileUrl: "https://example.com/f.pdf" });

    expect(result).toEqual({ success: false, error: "Upgrade to Pro to create this item type" });
    expect(createItemQuery).not.toHaveBeenCalled();
  });

  it("allows a Pro-only type for a Pro user when gating is enabled", async () => {
    process.env.PLAN_GATING_ENABLED = "true";
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1", isPro: true } } as never);
    vi.mocked(getItemTypeById).mockResolvedValue({ id: "type-1", name: "File" });
    vi.mocked(getItemCountForUser).mockResolvedValue(0);
    const created = { id: "item-1", title: "New title" };
    vi.mocked(createItemQuery).mockResolvedValue(created as never);

    const result = await createItem({ ...validCreatePayload, fileUrl: "https://example.com/f.pdf" });

    expect(result).toEqual({ success: true, data: created });
  });

  it("rejects a non-Pro user at the free item limit when gating is enabled", async () => {
    process.env.PLAN_GATING_ENABLED = "true";
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1", isPro: false } } as never);
    vi.mocked(getItemTypeById).mockResolvedValue({ id: "type-1", name: "Snippet" });
    vi.mocked(getItemCountForUser).mockResolvedValue(50);

    const result = await createItem(validCreatePayload);

    expect(result).toEqual({
      success: false,
      error: "You've reached the free plan's item limit. Upgrade to Pro for unlimited items.",
    });
    expect(createItemQuery).not.toHaveBeenCalled();
  });

  it("allows a Pro user over the free item limit when gating is enabled", async () => {
    process.env.PLAN_GATING_ENABLED = "true";
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1", isPro: true } } as never);
    vi.mocked(getItemTypeById).mockResolvedValue({ id: "type-1", name: "Snippet" });
    vi.mocked(getItemCountForUser).mockResolvedValue(500);
    const created = { id: "item-1", title: "New title" };
    vi.mocked(createItemQuery).mockResolvedValue(created as never);

    const result = await createItem(validCreatePayload);

    expect(result).toEqual({ success: true, data: created });
  });
});

describe("deleteItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns an error when there is no session", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);

    const result = await deleteItem("item-1");

    expect(result).toEqual({ success: false, error: "Not authenticated" });
    expect(getItemForDeletion).not.toHaveBeenCalled();
  });

  it("returns an error when the item does not exist", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as never);
    vi.mocked(getItemForDeletion).mockResolvedValue(null);

    const result = await deleteItem("item-1");

    expect(result).toEqual({ success: false, error: "Item not found" });
    expect(deleteItemQuery).not.toHaveBeenCalled();
  });

  it("returns an error when the session user does not own the item", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as never);
    vi.mocked(getItemForDeletion).mockResolvedValue({ userId: "someone-else", fileUrl: null });

    const result = await deleteItem("item-1");

    expect(result).toEqual({ success: false, error: "Not authorized to delete this item" });
    expect(deleteItemQuery).not.toHaveBeenCalled();
  });

  it("deletes the item when auth and ownership both pass", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as never);
    vi.mocked(getItemForDeletion).mockResolvedValue({ userId: "user-1", fileUrl: null });

    const result = await deleteItem("item-1");

    expect(deleteFromR2).not.toHaveBeenCalled();
    expect(deleteItemQuery).toHaveBeenCalledWith("item-1");
    expect(result).toEqual({ success: true, data: null });
  });

  it("deletes the R2 file when the item has an uploaded file", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as never);
    vi.mocked(getItemForDeletion).mockResolvedValue({
      userId: "user-1",
      fileUrl: "https://pub-example.r2.dev/user-1/abc-file.pdf",
    });
    vi.mocked(getKeyFromPublicUrl).mockReturnValue("user-1/abc-file.pdf");

    const result = await deleteItem("item-1");

    expect(getKeyFromPublicUrl).toHaveBeenCalledWith("https://pub-example.r2.dev/user-1/abc-file.pdf");
    expect(deleteFromR2).toHaveBeenCalledWith("user-1/abc-file.pdf");
    expect(deleteItemQuery).toHaveBeenCalledWith("item-1");
    expect(result).toEqual({ success: true, data: null });
  });
});

describe("toggleItemFavorite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns an error when there is no session", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);

    const result = await toggleItemFavorite("item-1", true);

    expect(result).toEqual({ success: false, error: "Not authenticated" });
    expect(getItemOwnerId).not.toHaveBeenCalled();
  });

  it("returns an error when the item does not exist", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as never);
    vi.mocked(getItemOwnerId).mockResolvedValue(null);

    const result = await toggleItemFavorite("item-1", true);

    expect(result).toEqual({ success: false, error: "Item not found" });
    expect(setItemFavorite).not.toHaveBeenCalled();
  });

  it("returns an error when the session user does not own the item", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as never);
    vi.mocked(getItemOwnerId).mockResolvedValue("someone-else");

    const result = await toggleItemFavorite("item-1", true);

    expect(result).toEqual({ success: false, error: "Not authorized to edit this item" });
    expect(setItemFavorite).not.toHaveBeenCalled();
  });

  it("sets the favorite flag when auth and ownership both pass", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as never);
    vi.mocked(getItemOwnerId).mockResolvedValue("user-1");

    const result = await toggleItemFavorite("item-1", true);

    expect(setItemFavorite).toHaveBeenCalledWith("item-1", true);
    expect(result).toEqual({ success: true, data: { isFavorite: true } });
  });
});

describe("toggleItemPin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns an error when there is no session", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);

    const result = await toggleItemPin("item-1", true);

    expect(result).toEqual({ success: false, error: "Not authenticated" });
    expect(getItemOwnerId).not.toHaveBeenCalled();
  });

  it("returns an error when the item does not exist", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as never);
    vi.mocked(getItemOwnerId).mockResolvedValue(null);

    const result = await toggleItemPin("item-1", true);

    expect(result).toEqual({ success: false, error: "Item not found" });
    expect(setItemPin).not.toHaveBeenCalled();
  });

  it("returns an error when the session user does not own the item", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as never);
    vi.mocked(getItemOwnerId).mockResolvedValue("someone-else");

    const result = await toggleItemPin("item-1", true);

    expect(result).toEqual({ success: false, error: "Not authorized to edit this item" });
    expect(setItemPin).not.toHaveBeenCalled();
  });

  it("sets the pinned flag when auth and ownership both pass", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as never);
    vi.mocked(getItemOwnerId).mockResolvedValue("user-1");

    const result = await toggleItemPin("item-1", true);

    expect(setItemPin).toHaveBeenCalledWith("item-1", true);
    expect(result).toEqual({ success: true, data: { isPinned: true } });
  });
});