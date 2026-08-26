"use client";

import { useSyncExternalStore } from "react";

// No-op subscription — mount state only ever flips once, right after hydration, so there's
// nothing to listen for; useSyncExternalStore re-checks the snapshot after commit on its own.
function subscribe() {
  return () => {};
}

function getSnapshot() {
  return true;
}

/** Server has no client-only state (e.g. next-themes' persisted preference) to read yet. */
function getServerSnapshot() {
  return false;
}

/**
 * True only after the client has hydrated. Use to gate rendering of anything that depends on
 * browser-only state (localStorage, next-themes' `theme`) that would otherwise mismatch
 * between server and client — the `useSyncExternalStore`-based idiom recommended by React,
 * avoids the `react-hooks/set-state-in-effect` lint issue an effect-based flag would trigger
 * (same reasoning as `useIsMobile.ts`).
 */
export function useHasMounted(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
