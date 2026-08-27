import { describe, expect, it, vi, beforeEach } from "vitest";
import { activateDemoPro, deactivateDemoPro } from "./billing";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db/users", () => ({
  getUserStripeCustomerId: vi.fn(),
  setUserPro: vi.fn(),
}));

import { auth } from "@/auth";
import { getUserStripeCustomerId, setUserPro } from "@/lib/db/users";

describe("activateDemoPro", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns an error when there is no session", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);

    const result = await activateDemoPro();

    expect(result).toEqual({ success: false, error: "You must be signed in." });
    expect(setUserPro).not.toHaveBeenCalled();
  });

  it("sets isPro true for the signed-in user", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as never);

    const result = await activateDemoPro();

    expect(setUserPro).toHaveBeenCalledWith("user-1", true);
    expect(result).toEqual({ success: true, data: { isPro: true } });
  });
});

describe("deactivateDemoPro", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns an error when there is no session", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);

    const result = await deactivateDemoPro();

    expect(result).toEqual({ success: false, error: "You must be signed in." });
    expect(getUserStripeCustomerId).not.toHaveBeenCalled();
  });

  it("refuses to revert a user with a real Stripe subscription", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as never);
    vi.mocked(getUserStripeCustomerId).mockResolvedValue("cus_real123");

    const result = await deactivateDemoPro();

    expect(result).toEqual({
      success: false,
      error: "You have a real subscription — manage it from the billing portal instead.",
    });
    expect(setUserPro).not.toHaveBeenCalled();
  });

  it("sets isPro false when the user has no Stripe customer id", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as never);
    vi.mocked(getUserStripeCustomerId).mockResolvedValue(null);

    const result = await deactivateDemoPro();

    expect(setUserPro).toHaveBeenCalledWith("user-1", false);
    expect(result).toEqual({ success: true, data: { isPro: false } });
  });
});
