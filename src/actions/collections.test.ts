import { describe, expect, it, vi, beforeEach } from "vitest";
import { createCollection } from "./collections";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db/collections", () => ({
  createCollection: vi.fn(),
}));

import { auth } from "@/auth";
import { createCollection as createCollectionQuery } from "@/lib/db/collections";

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