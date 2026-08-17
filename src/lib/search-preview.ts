// Search matching runs client-side against this preview on every keystroke, so it's
// kept short (and newline-free) rather than passing along a whole file's content —
// otherwise large snippets/notes make the palette lag while typing.
const SEARCH_PREVIEW_LENGTH = 200;

export function toSearchPreview(text: string): string {
  const singleLine = text.replace(/\s+/g, " ").trim();
  return singleLine.length > SEARCH_PREVIEW_LENGTH
    ? `${singleLine.slice(0, SEARCH_PREVIEW_LENGTH)}…`
    : singleLine;
}
