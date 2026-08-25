const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

/**
 * Appends an alpha suffix to a 6-digit hex color to derive a soft/tinted background,
 * matching the "ledger" design system's technique for type-color chip backgrounds
 * (kept-dashboard.html's `alpha = dark ? '2E' : '1F'`). The app is dark-mode-only today,
 * so callers default to the dark-mode suffix.
 *
 * Returns the color unchanged if it isn't a plain 6-digit hex (e.g. already has alpha,
 * or is some other CSS color format) rather than producing an invalid value.
 */
export function withAlpha(hex: string, alphaSuffix: string = "2E"): string {
  if (!HEX_COLOR_PATTERN.test(hex)) {
    return hex;
  }

  return `${hex}${alphaSuffix}`;
}
