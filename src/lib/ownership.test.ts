import { describe, expect, it, vi } from "vitest";
import { checkOwnership } from "./ownership";

describe("checkOwnership", () => {
  it("returns not-found error when the owner id can't be resolved", async () => {
    const getOwnerId = vi.fn().mockResolvedValue(null);

    const result = await checkOwnership(getOwnerId, "item-1", "user-1", "Item not found", "Not authorized to edit this item");

    expect(result).toEqual({ ok: false, error: "Item not found" });
    expect(getOwnerId).toHaveBeenCalledWith("item-1");
  });

  it("returns not-authorized error when the owner doesn't match the user", async () => {
    const getOwnerId = vi.fn().mockResolvedValue("other-user");

    const result = await checkOwnership(getOwnerId, "item-1", "user-1", "Item not found", "Not authorized to edit this item");

    expect(result).toEqual({ ok: false, error: "Not authorized to edit this item" });
  });

  it("returns ok when the owner matches the user", async () => {
    const getOwnerId = vi.fn().mockResolvedValue("user-1");

    const result = await checkOwnership(getOwnerId, "item-1", "user-1", "Item not found", "Not authorized to edit this item");

    expect(result).toEqual({ ok: true });
  });
});
