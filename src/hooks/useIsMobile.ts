"use client";

import { useSyncExternalStore } from "react";

/** Matches the app's `md:` Tailwind breakpoint (768px) used throughout the mobile chrome
 * (MobileTabBar, TopBar, MobileSidebar). */
const MOBILE_MEDIA_QUERY = "(max-width: 767px)";

function subscribe(callback: () => void) {
  const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY);
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia(MOBILE_MEDIA_QUERY).matches;
}

/** Server has no viewport — default to desktop to avoid a hydration mismatch. */
function getServerSnapshot() {
  return false;
}

/** Tracks whether the viewport is below the app's `md` breakpoint. */
export function useIsMobile(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
