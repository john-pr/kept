"use client";

import { cn } from "@/lib/utils";

interface PricingIntervalToggleProps {
  isYearly: boolean;
  onChange: (isYearly: boolean) => void;
  /** "default" matches the homepage/upgrade pricing cards; "compact" matches the settings billing card. */
  size?: "default" | "compact";
  className?: string;
}

/** Monthly/yearly switch shared by the pricing cards and the settings billing section. */
export function PricingIntervalToggle({
  isYearly,
  onChange,
  size = "default",
  className,
}: PricingIntervalToggleProps) {
  const compact = size === "compact";

  return (
    <div className={cn("flex items-center gap-3.5", compact ? "gap-3" : "justify-center", className)}>
      <span
        className={cn(
          compact
            ? "text-sm text-muted-foreground"
            : "text-sm font-semibold text-muted-foreground transition-colors",
          !isYearly && (compact ? "font-medium text-foreground" : "text-foreground")
        )}
      >
        Monthly
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={isYearly}
        aria-label="Toggle yearly pricing"
        onClick={() => onChange(!isYearly)}
        className={cn(
          "relative rounded-full border border-border bg-muted outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          compact ? "h-6 w-11" : "h-6.5 w-11.5",
          isYearly && "border-primary bg-primary"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 rounded-full bg-background transition-transform",
            compact ? "size-4.5" : "size-5",
            isYearly && "translate-x-5"
          )}
        />
      </button>
      <span
        className={cn(
          compact
            ? "text-sm text-muted-foreground"
            : "flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors",
          isYearly && (compact ? "font-medium text-foreground" : "text-foreground")
        )}
      >
        Yearly{" "}
        {compact ? (
          <span className="text-xs text-emerald-500">(save 25%)</span>
        ) : (
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[0.68rem] font-bold text-emerald-500">
            Save 25%
          </span>
        )}
      </span>
    </div>
  );
}
