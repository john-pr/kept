/**
 * Locale primitives shared by the request config, the `setLocale` server action,
 * and the language switcher. Kept in `src/lib` (not `src/i18n`) so the unit-test
 * runner — scoped to `src/lib/**` and `src/actions/**` — picks up `i18n.test.ts`.
 */

/**
 * Every locale we ship a message catalog for. `fr` is fully translated and kept
 * in sync (see `messages-parity.test.ts`) but held back from users for now —
 * it is NOT in `SUPPORTED_LOCALES`, so it can't be selected, matched from
 * `Accept-Language`, or restored from a cookie.
 */
export const ALL_LOCALES = ["en", "fr", "pl"] as const;

export type AnyLocale = (typeof ALL_LOCALES)[number];

/**
 * Locales actually exposed in the UI and accepted at runtime. To bring French
 * back, add `"fr"` here — nothing else needs to change.
 */
export const SUPPORTED_LOCALES = ["en", "pl"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Cookie name that holds an explicit locale choice for both anon and signed-in users. */
export const LOCALE_COOKIE = "locale";

/** One year — the choice should outlive a browsing session. */
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** Display names for the language switcher. Keyed by every catalog locale so the
 * French label is ready if `SUPPORTED_LOCALES` gets `"fr"` back. */
export const LOCALE_LABELS: Record<AnyLocale, string> = {
  en: "English",
  fr: "Français",
  pl: "Polski",
};

export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" &&
    (SUPPORTED_LOCALES as readonly string[]).includes(value)
  );
}

/**
 * Parses an `Accept-Language` header value and returns the first entry that
 * matches a supported locale (by primary subtag, so `fr-CA` matches `fr`),
 * honouring the client's quality-value ordering. Returns `null` when nothing
 * matches.
 */
export function matchAcceptLanguage(header: string | null | undefined): Locale | null {
  if (!header) return null;

  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const qParam = params.find((p) => p.trim().startsWith("q="));
      const q = qParam ? Number.parseFloat(qParam.trim().slice(2)) : 1;
      return { tag: tag.trim().toLowerCase(), q: Number.isFinite(q) ? q : 0 };
    })
    .filter((entry) => entry.tag.length > 0)
    .sort((a, b) => b.q - a.q);

  for (const { tag } of ranked) {
    const primary = tag.split("-")[0];
    if (isLocale(primary)) return primary;
  }

  return null;
}

/**
 * Resolves the effective locale for a request. An explicit cookie choice always
 * wins; otherwise fall back to the browser's `Accept-Language`; otherwise the
 * default locale.
 */
export function resolveLocale({
  cookieValue,
  acceptLanguage,
}: {
  cookieValue?: string | null;
  acceptLanguage?: string | null;
}): Locale {
  if (isLocale(cookieValue)) return cookieValue;
  return matchAcceptLanguage(acceptLanguage) ?? DEFAULT_LOCALE;
}
