import { describe, expect, it, vi } from "vitest";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { requireApiSessionUser, requireSessionUser } from "./auth-guard";

describe("requireSessionUser", () => {
  it("returns null when there is no session", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);

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

describe("requireApiSessionUser", () => {
  it("returns a 401 NextResponse when there is no session", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);

    const result = await requireApiSessionUser();

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(401);
    const body = await (result as NextResponse).json();
    expect(body).toEqual({ success: false, error: "Not authenticated" });
  });

  it("returns the session user when authenticated", async () => {
    const user = { id: "user-1", isPro: false };
    vi.mocked(auth).mockResolvedValue({ user } as never);

    expect(await requireApiSessionUser()).toEqual(user);
  });
});
