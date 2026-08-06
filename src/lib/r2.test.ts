import { afterEach, describe, expect, it, vi } from "vitest";

describe("getPublicUrl / getKeyFromPublicUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("builds a public URL from the configured base and key", async () => {
    vi.stubEnv("R2_PUBLIC_URL", "https://pub-example.r2.dev");
    const { getPublicUrl } = await import("./r2");

    expect(getPublicUrl("user-1/abc-file.pdf")).toBe(
      "https://pub-example.r2.dev/user-1/abc-file.pdf"
    );
  });

  it("throws when R2_PUBLIC_URL is not configured", async () => {
    vi.stubEnv("R2_PUBLIC_URL", "");
    const { getPublicUrl } = await import("./r2");

    expect(() => getPublicUrl("user-1/abc-file.pdf")).toThrow(/not configured/i);
  });

  it("extracts the object key from a matching public URL", async () => {
    vi.stubEnv("R2_PUBLIC_URL", "https://pub-example.r2.dev");
    const { getKeyFromPublicUrl } = await import("./r2");

    expect(getKeyFromPublicUrl("https://pub-example.r2.dev/user-1/abc-file.pdf")).toBe(
      "user-1/abc-file.pdf"
    );
  });

  it("returns null for a URL that doesn't match the configured base", async () => {
    vi.stubEnv("R2_PUBLIC_URL", "https://pub-example.r2.dev");
    const { getKeyFromPublicUrl } = await import("./r2");

    expect(getKeyFromPublicUrl("https://other-host.example.com/user-1/abc-file.pdf")).toBeNull();
  });

  it("returns null when R2_PUBLIC_URL is not configured", async () => {
    vi.stubEnv("R2_PUBLIC_URL", "");
    const { getKeyFromPublicUrl } = await import("./r2");

    expect(getKeyFromPublicUrl("https://pub-example.r2.dev/user-1/abc-file.pdf")).toBeNull();
  });
});