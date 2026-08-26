import { cn } from "@/lib/utils";
import { computeFillerClasses, type GridBreakpoint } from "@/lib/grid-filler";

interface GridFillerCellsProps {
  itemCount: number;
  /** Ascending, mobile-first breakpoints matching the grid's own `grid-cols-*` classes
   * exactly (including the base, unprefixed stage). */
  breakpoints: GridBreakpoint[];
}

/**
 * Renders invisible filler cells after a "collapsed-border grid" pattern's real items so a
 * ragged last row doesn't expose the grid container's `bg-border` fill as a solid gray "hole"
 * where no card exists. Was invisible in dark mode (--border sits close to --background/
 * --card there) but became a visible rendering-glitch-looking gray rectangle once the
 * light-mode border contrast fix (2026-08-26) darkened --border for legibility — flagged by
 * a light-mode UI review. Each filler paints `bg-card` (matching a real cell's own
 * background). See `src/lib/grid-filler.ts` for the per-breakpoint visibility math.
 */
export function GridFillerCells({ itemCount, breakpoints }: GridFillerCellsProps) {
  const classes = computeFillerClasses(itemCount, breakpoints);

  return classes.map((className, i) => (
    <div key={i} aria-hidden className={cn("bg-card", className)} />
  ));
}
