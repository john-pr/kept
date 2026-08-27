import { describe, expect, it } from "vitest";
import en from "@/messages/en.json";
import fr from "@/messages/fr.json";
import pl from "@/messages/pl.json";
import { ALL_LOCALES, SUPPORTED_LOCALES } from "./i18n";

/** Recursively collects every leaf key path (e.g. "auth.signIn.title") of a message object. */
function keyPaths(obj: unknown, prefix = ""): string[] {
  if (typeof obj !== "object" || obj === null) return [prefix];
  return Object.entries(obj as Record<string, unknown>).flatMap(([key, value]) =>
    keyPaths(value, prefix ? `${prefix}.${key}` : key),
  );
}

describe("message catalog parity", () => {
  const enKeys = keyPaths(en).sort();

  it("ships a catalog for every known locale", () => {
    expect([...ALL_LOCALES].sort()).toEqual(["en", "fr", "pl"]);
  });

  it("only exposes locales we ship a catalog for", () => {
    expect(SUPPORTED_LOCALES.every((l) => ALL_LOCALES.includes(l))).toBe(true);
    // fr is translated + parity-checked below, but held back from users for now.
    expect([...SUPPORTED_LOCALES].sort()).toEqual(["en", "pl"]);
  });

  it.each([
    ["fr", fr],
    ["pl", pl],
  ])("%s.json has exactly the same keys as en.json", (_name, catalog) => {
    const keys = keyPaths(catalog).sort();
    const missing = enKeys.filter((k) => !keys.includes(k));
    const extra = keys.filter((k) => !enKeys.includes(k));
    expect({ missing, extra }).toEqual({ missing: [], extra: [] });
  });
});
