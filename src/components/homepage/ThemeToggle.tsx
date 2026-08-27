"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useHasMounted } from "@/hooks/useHasMounted";
import { cn } from "@/lib/utils";

/**
 * Light/Dark toggle for the marketing nav — the only theme control reachable while signed
 * out (the in-app one lives in UserFooter's dropdown). A Sun/Switch/Moon control; checked
 * means dark.
 *
 * next-themes can't resolve the persisted preference during SSR, so until the client has
 * mounted we render as checked (defaultTheme is "dark") — matching the server markup to
 * avoid a hydration mismatch.
 */
export function ThemeToggle() {
  const mounted = useHasMounted();
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = !(mounted && resolvedTheme === "light");

  return (
    <div className="flex items-center gap-1.5">
      <Sun
        className={cn(
          "size-3.5 transition-colors",
          isDark ? "text-muted-foreground" : "text-foreground"
        )}
      />
      <Switch
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
        // Light mode's near-white default thumb barely reads against the pale unchecked
        // track — darken it here (scoped to this toggle, not the shared ui/switch).
        className="[&_[data-slot=switch-thumb][data-unchecked]]:bg-muted-foreground"
      />
      <Moon
        className={cn(
          "size-3.5 transition-colors",
          isDark ? "text-foreground" : "text-muted-foreground"
        )}
      />
    </div>
  );
}
