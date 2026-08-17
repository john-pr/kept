export function getPageCount(totalItems: number, perPage: number): number {
  return Math.max(1, Math.ceil(totalItems / perPage));
}

export function getPageSkip(page: number, perPage: number): number {
  return (getValidPage(page) - 1) * perPage;
}

/** Clamps a raw (possibly NaN/negative/non-integer) page value down to a valid 1-indexed page number. */
export function getValidPage(page: number): number {
  if (!Number.isFinite(page)) return 1;
  const rounded = Math.floor(page);
  return rounded < 1 ? 1 : rounded;
}

const ELLIPSIS = "ellipsis" as const;
export type PaginationRangeItem = number | typeof ELLIPSIS;

/**
 * Builds a windowed list of page numbers to display, always including the first and last
 * page, the current page, and one sibling on each side — collapsing gaps into "ellipsis".
 */
export function getPaginationRange(currentPage: number, totalPages: number): PaginationRangeItem[] {
  const page = Math.min(Math.max(getValidPage(currentPage), 1), Math.max(totalPages, 1));

  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const range: PaginationRangeItem[] = [1];

  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);

  if (start > 2) range.push(ELLIPSIS);
  for (let i = start; i <= end; i++) range.push(i);
  if (end < totalPages - 1) range.push(ELLIPSIS);

  range.push(totalPages);

  return range;
}
