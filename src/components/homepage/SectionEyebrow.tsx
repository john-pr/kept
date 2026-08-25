import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The small tracked label above a section heading ("Built for developers", "Features",
 * "Pricing"). Matches the design system's "section header" label convention
 * (context/design-system.md — Typography conventions).
 */
export function SectionEyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-block text-[11px] tracking-[0.14em] text-muted-foreground uppercase",
        className,
      )}
    >
      {children}
    </span>
  );
}
