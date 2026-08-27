import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n";

const BCP47: Record<Locale, string> = {
  en: "en-GB",
  fr: "fr-FR",
  pl: "pl-PL",
};

/**
 * Deterministic absolute-date formatter. Pins the timezone (and derives the
 * locale tag from the app locale, defaulting to `en-GB`) so the output is
 * identical on the server and in the browser regardless of the host's settings
 * — a bare `toLocaleDateString()` differs between the two and causes a React
 * hydration mismatch (previously hit in `FavoritesList`, `FileListRow`, and the
 * item drawer header). Callers pass the active locale from `useLocale()` /
 * `getLocale()`.
 *
 * Format (en): `6 Aug 2026`.
 */
export function formatDate(date: Date | string, locale: Locale = DEFAULT_LOCALE): string {
  return new Date(date).toLocaleDateString(BCP47[locale], {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
