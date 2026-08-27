/**
 * Deterministic absolute-date formatter. Pins both the locale and the timezone so
 * the output is identical on the server and in the browser regardless of the host's
 * settings — a bare `toLocaleDateString()` differs between the two and causes a
 * React hydration mismatch (previously hit in `FavoritesList`, `FileListRow`, and
 * the item drawer header).
 *
 * Format: `6 Aug 2026`.
 */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
