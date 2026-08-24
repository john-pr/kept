import { describe, expect, it, vi } from "vitest";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

import { auth } from "@/auth";
import { requireSessionUser } from "./auth-guard";

describe("requireSessionUser", () => {
  it("returns null when there is no session", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    expect(await requireSessionUser()).toBeNull();
  });

  it("returns null when the session has no user id", async () => {
    vi.mocked(auth).mockResolvedValue({ user: {} } as never);

    expect(await requireSessionUser()).toBeNull();
  });

  it("returns the session user when authenticated", async () => {
    const user = { id: "user-1", isPro: false };
    vi.mocked(auth).mockResolvedValue({ user } as never);

    expect(await requireSessionUser()).toEqual(user);
  });
});
