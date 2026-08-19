const CONTENT_CHAR_LIMIT = 2000;

interface ExplainInputFields {
  title: string;
  content: string;
  language: string | null;
}

/**
 * Builds the Responses API `input` text for a code-explanation request.
 * Plain-text response expected (rendered as markdown), so unlike
 * `buildAutoTagInput` there's no "json" keyword requirement to satisfy.
 */
export function buildExplainInput({ title, content, language }: ExplainInputFields): string {
  const lines = [`Title: ${title}`];
  if (language) lines.push(`Language: ${language}`);
  lines.push(`Code:\n${content.slice(0, CONTENT_CHAR_LIMIT)}`);
  return lines.join("\n\n");
}

/** Cleans up the model's raw markdown output: trims surrounding whitespace. */
export function parseExplainResponse(text: string): string {
  return text.trim();
}
