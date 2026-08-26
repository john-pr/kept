export interface GridBreakpoint {
  /** Tailwind responsive prefix (e.g. "sm", "md", "lg") — omit for the unprefixed base stage. */
  prefix?: string;
  cols: number;
}

/**
 * Computes the Tailwind `hidden`/`block` className for each filler cell needed to prevent a
 * "collapsed-border grid" pattern's ragged last row from exposing the grid container's
 * `bg-border` fill as a visible gray "hole" where no card exists. Returns one class string
 * per filler cell (`maxCols - 1` of them), each listing every breakpoint's visibility token
 * for that cell's position within the row — since the number of cells the last row is short
 * differs per breakpoint's column count, a fixed filler count can't be uniformly shown/hidden;
 * each cell's visibility must be computed per breakpoint.
 */
export function computeFillerClasses(itemCount: number, breakpoints: GridBreakpoint[]): string[] {
  const maxCols = Math.max(...breakpoints.map((b) => b.cols));
  const fillerCount = maxCols - 1;

  function neededAt(cols: number) {
    const remainder = itemCount % cols;
    return remainder === 0 ? 0 : cols - remainder;
  }

  return Array.from({ length: fillerCount }, (_, i) => {
    const position = i + 1;
    return breakpoints
      .map(({ prefix, cols }) => {
        const token = position <= neededAt(cols) ? "block" : "hidden";
        return prefix ? `${prefix}:${token}` : token;
      })
      .join(" ");
  });
}
