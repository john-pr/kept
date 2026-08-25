const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const MONTH = 30 * DAY;

/**
 * Formats a past date as a short relative-time label (e.g. "2h ago", "3d ago"),
 * matching the dashboard item cards' "ledger" style timestamp. Callers apply
 * uppercase via CSS, matching the rest of the design system's label treatment.
 */
export function formatRelativeTime(date: Date, now: Date = new Date()): string {
  const diffMs = Math.max(0, now.getTime() - date.getTime());

  if (diffMs < MINUTE) return "just now";
  if (diffMs < HOUR) return `${Math.floor(diffMs / MINUTE)}m ago`;
  if (diffMs < DAY) return `${Math.floor(diffMs / HOUR)}h ago`;
  if (diffMs < MONTH) return `${Math.floor(diffMs / DAY)}d ago`;

  return `${Math.floor(diffMs / MONTH)}mo ago`;
}
