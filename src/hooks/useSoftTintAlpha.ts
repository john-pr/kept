"use client";

import { useTheme } from "next-themes";
import { useHasMounted } from "@/hooks/useHasMounted";

/**
 * Alpha suffix for `withAlpha()`'s soft-tint chip backgrounds (item-type icon chips on
 * ItemCard/CollectionCard/SidebarNav/ItemDrawer) — matches the original mockup's own
 * `alpha = dark ? '2E' : '1F'` logic (kept-dashboard.html), never wired up until a
 * light-mode UI review found the dark-only "2E" suffix nearly illegible against light
 * backgrounds (e.g. the Notes type icon measured ~1.07:1 contrast).
 *
 * Returns the dark-mode suffix until the client has mounted and next-themes has resolved
 * the actual theme — matches what the server rendered (defaultTheme is "dark"), avoiding a
 * hydration mismatch on the many chip `style` attributes this feeds across the app.
 */
export function useSoftTintAlpha(): string {
  const mounted = useHasMounted();
  const { resolvedTheme } = useTheme();

  if (!mounted) return "2E";
  return resolvedTheme === "light" ? "1F" : "2E";
}
