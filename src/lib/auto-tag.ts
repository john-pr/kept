const CONTENT_CHAR_LIMIT = 2000;

/**
 * Parses the raw JSON text returned by the Responses API for an auto-tag
 * request into a clean list of lowercase tags.
 *
 * gpt-5-nano's json_object output isn't schema-constrained, so it has been
 * observed to sometimes return a bare array (`["a","b"]`) instead of the
 * requested `{"tags": [...]}` shape — handle both defensively rather than
 * trusting the model's output format.
 */
export function parseAutoTagResponse(text: string): string[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return [];
  }

  const rawTags = Array.isArray(parsed)
    ? parsed
    : Array.isArray((parsed as { tags?: unknown })?.tags)
      ? (parsed as { tags: unknown[] }).tags
      : [];

  const seen = new Set<string>();
  const tags: string[] = [];
  for (const rawTag of rawTags) {
    if (typeof rawTag !== "string") continue;
    const normalized = rawTag.trim().toLowerCase();
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    tags.push(normalized);
  }

  return tags;
}

/**
 * Builds the Responses API `input` text for an auto-tag request, truncating
 * content per the spec.
 *
 * The literal word "json" must appear somewhere in the input message for
 * `text: { format: { type: "json_object" } }` to be accepted — the API
 * rejects the request with a 400 otherwise, even when the system/
 * `instructions` message already mentions JSON. Confirmed against a live
 * 400 response ("Response input messages must contain the word 'json' in
 * some form...") while testing this feature manually.
 */
export function buildAutoTagInput(title: string, content: string | null): string {
  const truncatedContent = (content ?? "").slice(0, CONTENT_CHAR_LIMIT);
  return `Title: ${title}\n\nContent:\n${truncatedContent}\n\nRespond only with a JSON object: {"tags": ["tag1", "tag2"]}.`;
}
