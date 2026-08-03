import { describe, expect, it, vi, beforeEach } from "vitest";
import { updateItem } from "./items";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db/items", () => ({
  getItemOwnerId: vi.fn(),
  updateItem: vi.fn(),
}));

import { auth } from "@/auth";
import { getItemOwnerId, updateItem as updateItemQuery } from "@/lib/db/items";

const validPayload = {
  title: "Updated title",
  description: null,
  content: null,
  url: null,
  language: null,
  tags: [] as string[],
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
    vi.mocked(auth).mockResolvedValue(null);

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

    expect(updateItemQuery).toHaveBeenCalledWith("item-1", validPayload);
    expect(result).toEqual({ success: true, data: updated });
  });
});