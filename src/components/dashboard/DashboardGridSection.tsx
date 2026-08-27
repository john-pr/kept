import { Children, type ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";
import { GridFillerCells } from "@/components/dashboard/GridFillerCells";

const GRID_BREAKPOINTS = [{ cols: 1 }, { prefix: "sm", cols: 2 }, { prefix: "lg", cols: 3 }];

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
export async function DashboardGridSection({
  title,
  count,
  children,
  mobileScroll = false,
}: DashboardGridSectionProps) {
  const t = await getTranslations("dashboard");
  return (
    <section className="flex flex-col gap-px">
      <div className="flex items-baseline justify-between border-b border-rule-strong pb-2.5">
        <span className="text-xs tracking-[0.14em] text-muted-foreground uppercase">{title}</span>
        <span className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase tabular-nums">
          {t("records", { count: String(count).padStart(2, "0") })}
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
              // no visual cue the row scrolls (flagged by ui-reviewer). `h-full` lets the
              // wrapped card (itself `h-full`) fill the grid row's stretched height at
              // sm:/lg: — without it, the wrapper stretches (it's the actual grid item) but
              // the card inside stays only as tall as its own content, since a plain block
              // child doesn't inherit a stretched parent's height automatically.
              <div key={index} className="w-[calc(80vw-32px)] shrink-0 snap-start sm:h-full sm:w-auto">
                {child}
              </div>
            ))
          : children}
        {/* `mobileScroll` sections still render the sm:/lg: grid (only the mobile layout
            differs), so filler cells apply to both branches — hidden by default (base stage
            is always 1 column, never ragged), so they're inert in the mobile scroll strip. */}
        <GridFillerCells itemCount={count} breakpoints={GRID_BREAKPOINTS} />
      </div>
    </section>
  );
}
