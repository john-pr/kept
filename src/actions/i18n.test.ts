import { describe, expect, it, vi, beforeEach } from "vitest";

const cookieSet = vi.fn();

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({ set: cookieSet })),
}));

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: { user: { update: vi.fn() } },
}));

import { setLocale } from "./i18n";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

describe("setLocale", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects an unsupported locale without writing anything", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as never);

    const result = await setLocale("de");

    expect(result).toEqual({ success: false, error: "Unsupported locale" });
    expect(cookieSet).not.toHaveBeenCalled();
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it("rejects a held-back catalog locale (fr) — not currently offered", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as never);

    const result = await setLocale("fr");

    expect(result).toEqual({ success: false, error: "Unsupported locale" });
    expect(cookieSet).not.toHaveBeenCalled();
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it("sets the cookie only when there is no session", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const result = await setLocale("en");

    expect(result).toEqual({ success: true, data: { locale: "en" } });
    expect(cookieSet).toHaveBeenCalledWith("locale", "en", expect.objectContaining({ path: "/" }));
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it("also persists to User.locale for a signed-in user", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as never);

    const result = await setLocale("pl");

    expect(result).toEqual({ success: true, data: { locale: "pl" } });
    expect(cookieSet).toHaveBeenCalledWith("locale", "pl", expect.objectContaining({ path: "/" }));
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { locale: "pl" },
    });
  });
});
