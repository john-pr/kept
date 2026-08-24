/** Naively singularizes a plural noun by dropping a trailing "s" (e.g. "Snippets" → "Snippet"). */
export function singularize(name: string): string {
  return name.endsWith("s") ? name.slice(0, -1) : name;
}
