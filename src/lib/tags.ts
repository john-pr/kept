/** Splits a comma-separated tags input into trimmed, non-empty tags. */
export function parseTagsInput(value: string): string[] {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

/** Appends a tag to a comma-separated tags input, returning the new input string. */
export function appendTagToInput(tagsInput: string, tag: string): string {
  return [...parseTagsInput(tagsInput), tag].join(", ");
}
