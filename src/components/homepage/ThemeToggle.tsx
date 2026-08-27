"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHasMounted } from "@/hooks/useHasMounted";

/**
 * Light/Dark toggle for the marketing nav — the only theme control reachable while signed
 * out (the in-app one lives in UserFooter's dropdown). Icon button rather than UserFooter's
 * segmented control, to sit compactly beside Sign In / Get Started.
 *
 * next-themes can't resolve the persisted preference during SSR, so until the client has
 * mounted we render the dark-mode icon (defaultTheme is "dark") with a generic label — this
 * matches the server markup and avoids a hydration mismatch.
 */
export function ThemeToggle() {
  const mounted = useHasMounted();
  const { resolvedTheme, setTheme } = useTheme();
  const isLight = mounted && resolvedTheme === "light";

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-9 md:size-8"
      aria-label={
        mounted ? `Switch to ${isLight ? "dark" : "light"} theme` : "Toggle theme"
      }
      onClick={() => setTheme(isLight ? "dark" : "light")}
    >
      {isLight ? <Moon /> : <Sun />}
    </Button>
  );
}
