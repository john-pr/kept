import { Children, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DashboardGridSectionProps {
  title: string;
  count: number;
  children: ReactNode;
  /** Mobile-only: renders children as a horizontal snap-scroll strip instead of a stacked
   * single column, matching the "ledger" mobile prototype's Pinned/Recent Items sections.
   * `sm:`/`lg:` breakpoints are unaffected (still the multi-column grid). */
  mobileScroll?: boolean;
}

/** Shared "titled grid" shape used by the dashboard's pinned/recent items and recent collections sections. */
export function DashboardGridSection({
  title,
  count,
  children,
  mobileScroll = false,
}: DashboardGridSectionProps) {
  return (
    <section className="flex flex-col gap-px">
      <div className="flex items-baseline justify-between border-b border-rule-strong pb-2.5">
        <span className="text-xs tracking-[0.14em] text-muted-foreground uppercase">{title}</span>
        <span className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase tabular-nums">
          {String(count).padStart(2, "0")} records
        </span>
      </div>
      <div
        className={cn(
          "gap-px border border-t-0 border-border bg-border sm:grid sm:grid-cols-2 lg:grid-cols-3",
          mobileScroll
            ? "flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] sm:overflow-visible [&::-webkit-scrollbar]:hidden"
            : "grid grid-cols-1"
        )}
      >
        {mobileScroll
          ? Children.map(children, (child, index) => (
              // Sized narrower than the scroll track itself (100vw minus `main`'s p-4
              // horizontal padding) so the next card visibly peeks in at rest — the previous
              // 82vw was *wider* than the track, hiding even the first card fully and giving
              // no visual cue the row scrolls (flagged by ui-reviewer).
              <div key={index} className="w-[calc(80vw-32px)] shrink-0 snap-start sm:w-auto">
                {child}
              </div>
            ))
          : children}
      </div>
    </section>
  );
}
