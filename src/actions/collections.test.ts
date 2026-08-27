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
  getCollectionCountForUser: vi.fn(),
  setCollectionFavorite: vi.fn(),
  updateCollection: vi.fn(),
}));

import { auth } from "@/auth";
import {
  createCollection as createCollectionQuery,
  deleteCollection as deleteCollectionQuery,
  getCollectionCountForUser,
  getCollectionOwnerId,
  setCollectionFavorite,
  updateCollection as updateCollectionQuery,
} from "@/lib/db/collections";

const validPayload = {
  name: "React Patterns",
  description: null,
};

describe("createCollection", () => {
  const originalPlanGating = process.env.PLAN_GATING_ENABLED;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.PLAN_GATING_ENABLED = originalPlanGating;
  });

  it("rejects an empty name before touching the database", async () => {
    const result = await createCollection({ ...validPayload, name: "  " });

    expect(result).toEqual({ success: false, error: "Name is required" });
    expect(auth).not.toHaveBeenCalled();
  });

  it("returns an error when there is no session", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);

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

  it("ignores gating limits when the flag is disabled, even over the free collection limit", async () => {
    process.env.PLAN_GATING_ENABLED = "false";
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1", isPro: false } } as never);
    const created = { id: "collection-1", name: "React Patterns" };
    vi.mocked(createCollectionQuery).mockResolvedValue(created as never);

    const result = await createCollection(validPayload);

    expect(getCollectionCountForUser).not.toHaveBeenCalled();
    expect(result).toEqual({ success: true, data: created });
  });

  it("rejects a non-Pro user at the free collection limit when gating is enabled", async () => {
    process.env.PLAN_GATING_ENABLED = "true";
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1", isPro: false } } as never);
    vi.mocked(getCollectionCountForUser).mockResolvedValue(3);

    const result = await createCollection(validPayload);

    expect(result).toEqual({
      success: false,
      error: "You've reached the free plan's collection limit. Upgrade to Pro for unlimited collections.",
    });
    expect(createCollectionQuery).not.toHaveBeenCalled();
  });

  it("allows a Pro user over the free collection limit when gating is enabled", async () => {
    process.env.PLAN_GATING_ENABLED = "true";
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1", isPro: true } } as never);
    vi.mocked(getCollectionCountForUser).mockResolvedValue(10);
    const created = { id: "collection-1", name: "React Patterns" };
    vi.mocked(createCollectionQuery).mockResolvedValue(created as never);

    const result = await createCollection(validPayload);

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
    vi.mocked(auth).mockResolvedValue(null as never);

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
    vi.mocked(auth).mockResolvedValue(null as never);

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
    vi.mocked(auth).mockResolvedValue(null as never);

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