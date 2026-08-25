/** Naively singularizes a plural noun by dropping a trailing "s" (e.g. "Snippets" → "Snippet"). */
export function singularize(name: string): string {
  return name.endsWith("s") ? name.slice(0, -1) : name;
}

/** Pluralizes a noun by count (naive, adds a trailing "s"), e.g. pluralize(1, "collection") → "1 collection". */
export function pluralize(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}
