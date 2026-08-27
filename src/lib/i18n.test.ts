import { describe, expect, it } from "vitest";
import {
  DEFAULT_LOCALE,
  isLocale,
  matchAcceptLanguage,
  resolveLocale,
} from "./i18n";

describe("isLocale", () => {
  it("accepts supported locales", () => {
    expect(isLocale("en")).toBe(true);
    expect(isLocale("pl")).toBe(true);
  });

  it("rejects anything else, including catalog locales held back from users", () => {
    expect(isLocale("fr")).toBe(false);
    expect(isLocale("de")).toBe(false);
    expect(isLocale("EN")).toBe(false);
    expect(isLocale("")).toBe(false);
    expect(isLocale(undefined)).toBe(false);
    expect(isLocale(null)).toBe(false);
    expect(isLocale(42)).toBe(false);
  });
});

describe("matchAcceptLanguage", () => {
  it("matches by primary subtag", () => {
    expect(matchAcceptLanguage("pl-PL")).toBe("pl");
    expect(matchAcceptLanguage("en-GB")).toBe("en");
  });

  it("honours quality-value ordering over source order", () => {
    expect(matchAcceptLanguage("de;q=0.9, en;q=0.8, pl;q=1.0")).toBe("pl");
  });

  it("skips unsupported languages (incl. held-back fr) and takes the first supported one", () => {
    expect(matchAcceptLanguage("de-DE, es, fr, pl, en")).toBe("pl");
  });

  it("returns null when nothing matches", () => {
    expect(matchAcceptLanguage("de-DE, es-ES")).toBeNull();
    expect(matchAcceptLanguage("fr-FR,fr;q=0.9")).toBeNull();
    expect(matchAcceptLanguage("")).toBeNull();
    expect(matchAcceptLanguage(null)).toBeNull();
    expect(matchAcceptLanguage(undefined)).toBeNull();
  });
});

describe("resolveLocale", () => {
  it("prefers an explicit cookie choice over everything else", () => {
    expect(
      resolveLocale({ cookieValue: "pl", acceptLanguage: "en-US,en;q=0.9" }),
    ).toBe("pl");
  });

  it("falls back to the Accept-Language header when there is no cookie", () => {
    expect(
      resolveLocale({ cookieValue: undefined, acceptLanguage: "pl-PL,pl;q=0.9" }),
    ).toBe("pl");
  });

  it("ignores an unsupported cookie value and uses the header", () => {
    expect(
      resolveLocale({ cookieValue: "de", acceptLanguage: "pl" }),
    ).toBe("pl");
  });

  it("ignores a held-back locale (fr) in both the cookie and the header", () => {
    expect(
      resolveLocale({ cookieValue: "fr", acceptLanguage: "fr-FR,fr;q=0.9" }),
    ).toBe(DEFAULT_LOCALE);
  });

  it("returns the default locale when nothing is usable", () => {
    expect(resolveLocale({})).toBe(DEFAULT_LOCALE);
    expect(
      resolveLocale({ cookieValue: "de", acceptLanguage: "es-ES" }),
    ).toBe(DEFAULT_LOCALE);
  });
});
