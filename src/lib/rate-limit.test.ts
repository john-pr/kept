import { describe, expect, it } from "vitest";
import { getRequestIp, retryAfterMessage } from "./rate-limit";

describe("getRequestIp", () => {
  it("reads the first entry from x-forwarded-for", () => {
    const request = new Request("https://example.com", {
      headers: { "x-forwarded-for": "203.0.113.1, 10.0.0.1" },
    });
    expect(getRequestIp(request)).toBe("203.0.113.1");
  });

  it("falls back to 'unknown' when the header is missing", () => {
    const request = new Request("https://example.com");
    expect(getRequestIp(request)).toBe("unknown");
  });
});

describe("retryAfterMessage", () => {
  it("pluralizes minutes when more than one remains", () => {
    const reset = Date.now() + 5 * 60_000;
    expect(retryAfterMessage(reset)).toBe("Too many attempts. Please try again in 5 minutes.");
  });

  it("uses singular minute when exactly one remains", () => {
    const reset = Date.now() + 30_000;
    expect(retryAfterMessage(reset)).toBe("Too many attempts. Please try again in 1 minute.");
  });

  it("floors at 1 minute even if reset is already in the past", () => {
    const reset = Date.now() - 1000;
    expect(retryAfterMessage(reset)).toBe("Too many attempts. Please try again in 1 minute.");
  });
});