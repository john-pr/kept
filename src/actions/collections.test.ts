import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  createCollection,
  deleteCollection,
  toggleCollectionFavorite,
  updateCollection,
} from "./collections";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db/collections", () => ({
  createCollection: vi.fn(),
  deleteCollection: vi.fn(),
  getCollectionOwnerId: vi.fn(),
  setCollectionFavorite: vi.fn(),
  updateCollection: vi.fn(),
}));

import { auth } from "@/auth";
import {
  createCollection as createCollectionQuery,
  deleteCollection as deleteCollectionQuery,
  getCollectionOwnerId,
  setCollectionFavorite,
  updateCollection as updateCollectionQuery,
} from "@/lib/db/collections";

const validPayload = {
  name: "React Patterns",
  description: null,
};

describe("createCollection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects an empty name before touching the database", async () => {
    const result = await createCollection({ ...validPayload, name: "  " });

    expect(result).toEqual({ success: false, error: "Name is required" });
    expect(auth).not.toHaveBeenCalled();
  });

  it("returns an error when there is no session", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const result = await createCollection(validPayload);

    expect(result).toEqual({ success: false, error: "Not authenticated" });
    expect(createCollectionQuery).not.toHaveBeenCalled();
  });

  it("creates the collection when validation and auth both pass", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as never);
    const created = { id: "collection-1", name: "React Patterns" };
    vi.mocked(createCollectionQuery).mockResolvedValue(created as never);

    const result = await createCollection(validPayload);

    expect(createCollectionQuery).toHaveBeenCalledWith({ ...validPayload, userId: "user-1" });
    expect(result).toEqual({ success: true, data: created });
  });
});

describe("updateCollection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects an empty name before touching the database", async () => {
    const result = await updateCollection("collection-1", { ...validPayload, name: "  " });

    expect(result).toEqual({ success: false, error: "Name is required" });
    expect(auth).not.toHaveBeenCalled();
  });

  it("returns an error when there is no session", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const result = await updateCollection("collection-1", validPayload);

    expect(result).toEqual({ success: false, error: "Not authenticated" });
    expect(getCollectionOwnerId).not.toHaveBeenCalled();
  });

  it("returns an error when the collection doesn't exist", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as never);
    vi.mocked(getCollectionOwnerId).mockResolvedValue(null);

    const result = await updateCollection("collection-1", validPayload);

    expect(result).toEqual({ success: false, error: "Collection not found" });
    expect(updateCollectionQuery).not.toHaveBeenCalled();
  });

  it("returns an error when the session user doesn't own the collection", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as never);
    vi.mocked(getCollectionOwnerId).mockResolvedValue("user-2");

    const result = await updateCollection("collection-1", validPayload);

    expect(result).toEqual({ success: false, error: "Not authorized to edit this collection" });
    expect(updateCollectionQuery).not.toHaveBeenCalled();
  });

  it("updates the collection when validation, auth, and ownership all pass", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as never);
    vi.mocked(getCollectionOwnerId).mockResolvedValue("user-1");
    const updated = { id: "collection-1", name: "React Patterns" };
    vi.mocked(updateCollectionQuery).mockResolvedValue(updated as never);

    const result = await updateCollection("collection-1", validPayload);

    expect(updateCollectionQuery).toHaveBeenCalledWith("collection-1", validPayload);
    expect(result).toEqual({ success: true, data: updated });
  });
});

describe("deleteCollection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns an error when there is no session", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const result = await deleteCollection("collection-1");

    expect(result).toEqual({ success: false, error: "Not authenticated" });
    expect(getCollectionOwnerId).not.toHaveBeenCalled();
  });

  it("returns an error when the collection doesn't exist", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as never);
    vi.mocked(getCollectionOwnerId).mockResolvedValue(null);

    const result = await deleteCollection("collection-1");

    expect(result).toEqual({ success: false, error: "Collection not found" });
    expect(deleteCollectionQuery).not.toHaveBeenCalled();
  });

  it("returns an error when the session user doesn't own the collection", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as never);
    vi.mocked(getCollectionOwnerId).mockResolvedValue("user-2");

    const result = await deleteCollection("collection-1");

    expect(result).toEqual({ success: false, error: "Not authorized to delete this collection" });
    expect(deleteCollectionQuery).not.toHaveBeenCalled();
  });

  it("deletes the collection when auth and ownership both pass", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as never);
    vi.mocked(getCollectionOwnerId).mockResolvedValue("user-1");
    vi.mocked(deleteCollectionQuery).mockResolvedValue(undefined);

    const result = await deleteCollection("collection-1");

    expect(deleteCollectionQuery).toHaveBeenCalledWith("collection-1");
    expect(result).toEqual({ success: true, data: null });
  });
});

describe("toggleCollectionFavorite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns an error when there is no session", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const result = await toggleCollectionFavorite("collection-1", true);

    expect(result).toEqual({ success: false, error: "Not authenticated" });
    expect(getCollectionOwnerId).not.toHaveBeenCalled();
  });

  it("returns an error when the collection doesn't exist", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as never);
    vi.mocked(getCollectionOwnerId).mockResolvedValue(null);

    const result = await toggleCollectionFavorite("collection-1", true);

    expect(result).toEqual({ success: false, error: "Collection not found" });
    expect(setCollectionFavorite).not.toHaveBeenCalled();
  });

  it("returns an error when the session user doesn't own the collection", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as never);
    vi.mocked(getCollectionOwnerId).mockResolvedValue("user-2");

    const result = await toggleCollectionFavorite("collection-1", true);

    expect(result).toEqual({ success: false, error: "Not authorized to edit this collection" });
    expect(setCollectionFavorite).not.toHaveBeenCalled();
  });

  it("sets the favorite flag when auth and ownership both pass", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as never);
    vi.mocked(getCollectionOwnerId).mockResolvedValue("user-1");

    const result = await toggleCollectionFavorite("collection-1", true);

    expect(setCollectionFavorite).toHaveBeenCalledWith("collection-1", true);
    expect(result).toEqual({ success: true, data: { isFavorite: true } });
  });
});