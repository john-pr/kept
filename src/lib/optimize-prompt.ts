const CONTENT_CHAR_LIMIT = 2000;

interface OptimizePromptInputFields {
  title: string;
  content: string;
}

/**
 * Builds the Responses API `input` text for a prompt-optimization request.
 * Plain-text response expected (the refined prompt itself), so unlike
 * `buildAutoTagInput` there's no "json" keyword requirement to satisfy.
 */
export function buildOptimizePromptInput({ title, content }: OptimizePromptInputFields): string {
  return [`Title: ${title}`, `Prompt:\n${content.slice(0, CONTENT_CHAR_LIMIT)}`].join("\n\n");
}

/** Cleans up the model's raw output: trims whitespace and surrounding quotes. */
export function parseOptimizePromptResponse(text: string): string {
  return text.trim().replace(/^["']|["']$/g, "");
}
