const CONTENT_CHAR_LIMIT = 2000;
const MAX_DESCRIPTION_CHARS = 300;

interface DescriptionInputFields {
  title: string;
  content: string | null;
  url: string | null;
  language: string | null;
  fileName: string | null;
}

/**
 * Builds the Responses API `input` text for a description-generation request,
 * from whatever fields are currently filled in on the item form (works pre-save,
 * across all content types). Unlike `buildAutoTagInput`, the response here is
 * plain text rather than JSON, so there's no "json" keyword requirement to
 * satisfy — see `auto-tag.ts` for that gotcha.
 */
export function buildDescriptionInput({
  title,
  content,
  url,
  language,
  fileName,
}: DescriptionInputFields): string {
  const lines = [`Title: ${title}`];

  if (fileName) lines.push(`File name: ${fileName}`);
  if (language) lines.push(`Language: ${language}`);
  if (url) lines.push(`URL: ${url}`);
  if (content && content.trim() !== "") {
    lines.push(`Content:\n${content.slice(0, CONTENT_CHAR_LIMIT)}`);
  }

  return lines.join("\n\n");
}

/** Cleans up the model's raw text output: trims whitespace/quotes and enforces a sane length cap. */
export function parseDescriptionResponse(text: string): string {
  const cleaned = text.trim().replace(/^["']|["']$/g, "");
  return cleaned.slice(0, MAX_DESCRIPTION_CHARS);
}
