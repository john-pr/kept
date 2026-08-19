"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { getOpenAIClient, AI_MODEL } from "@/lib/openai";
import { buildAutoTagInput, parseAutoTagResponse } from "@/lib/auto-tag";
import { buildDescriptionInput, parseDescriptionResponse } from "@/lib/description";
import { buildExplainInput, parseExplainResponse } from "@/lib/explain";
import { isPlanGatingEnabled } from "@/lib/plan-limits";
import { checkRateLimit, retryAfterMessage } from "@/lib/rate-limit";

const AUTO_TAG_RATE_LIMIT = 20;
const AUTO_TAG_RATE_WINDOW_SECONDS = 3600;

const DESCRIPTION_RATE_LIMIT = 20;
const DESCRIPTION_RATE_WINDOW_SECONDS = 3600;

const EXPLAIN_RATE_LIMIT = 20;
const EXPLAIN_RATE_WINDOW_SECONDS = 3600;

const generateAutoTagsSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  content: z.string().nullable(),
});

export type GenerateAutoTagsPayload = z.infer<typeof generateAutoTagsSchema>;

const generateDescriptionSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  content: z.string().nullable(),
  url: z.string().nullable(),
  language: z.string().nullable(),
  fileName: z.string().nullable(),
});

export type GenerateDescriptionPayload = z.infer<typeof generateDescriptionSchema>;

const explainCodeSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  content: z.string().trim().min(1, "Content is required"),
  language: z.string().nullable(),
});

export type ExplainCodePayload = z.infer<typeof explainCodeSchema>;

interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Suggests freeform tags for an item's title/content via OpenAI.
 *
 * Takes the raw title/content rather than an item id so it works for items
 * that haven't been created yet (New Item dialog), not just existing ones
 * (Item Drawer edit mode) — there's nothing to own/fetch/check yet in the
 * create-dialog case, so auth + Pro-gate + rate limit are the only guards.
 */
export async function generateAutoTags(
  data: GenerateAutoTagsPayload
): Promise<ActionResult<string[]>> {
  const parsed = generateAutoTagsSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  if (isPlanGatingEnabled() && !session.user.isPro) {
    return { success: false, error: "AI features require a Pro plan" };
  }

  const rateLimit = await checkRateLimit(
    "ai-auto-tag",
    session.user.id,
    AUTO_TAG_RATE_LIMIT,
    AUTO_TAG_RATE_WINDOW_SECONDS
  );
  if (!rateLimit.success) {
    return { success: false, error: retryAfterMessage(rateLimit.reset) };
  }

  try {
    const client = getOpenAIClient();
    const response = await client.responses.create({
      model: AI_MODEL,
      instructions:
        'You suggest concise, lowercase tags for a developer\'s saved snippet, prompt, command, note, or link. Return 3-5 tags as a JSON object: {"tags": ["tag1", "tag2"]}.',
      input: buildAutoTagInput(parsed.data.title, parsed.data.content),
      text: {
        format: { type: "json_object" },
      },
    });

    const tags = parseAutoTagResponse(response.output_text);
    if (tags.length === 0) {
      return { success: false, error: "Couldn't generate tag suggestions. Please try again." };
    }

    return { success: true, data: tags };
  } catch {
    return { success: false, error: "Something went wrong generating suggestions." };
  }
}

/**
 * Generates a concise 1-2 sentence description for an item via OpenAI, from
 * whatever title/content/url/language/fileName is currently on the form.
 *
 * Takes raw form fields rather than an item id, mirroring `generateAutoTags`,
 * so it works pre-save for both the New Item dialog and the Item Drawer's
 * edit form.
 */
export async function generateDescription(
  data: GenerateDescriptionPayload
): Promise<ActionResult<string>> {
  const parsed = generateDescriptionSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  if (isPlanGatingEnabled() && !session.user.isPro) {
    return { success: false, error: "AI features require a Pro plan" };
  }

  const rateLimit = await checkRateLimit(
    "ai-description",
    session.user.id,
    DESCRIPTION_RATE_LIMIT,
    DESCRIPTION_RATE_WINDOW_SECONDS
  );
  if (!rateLimit.success) {
    return { success: false, error: retryAfterMessage(rateLimit.reset) };
  }

  try {
    const client = getOpenAIClient();
    const response = await client.responses.create({
      model: AI_MODEL,
      instructions:
        "You write a concise, 1-2 sentence description summarizing a developer's saved snippet, prompt, command, note, link, file, or image, based on whatever title/content/url/language/file name is given. Respond with only the description text, no quotes or labels.",
      input: buildDescriptionInput(parsed.data),
    });

    const description = parseDescriptionResponse(response.output_text);
    if (!description) {
      return { success: false, error: "Couldn't generate a description. Please try again." };
    }

    return { success: true, data: description };
  } catch {
    return { success: false, error: "Something went wrong generating a description." };
  }
}

/**
 * Explains a snippet/command's code via OpenAI. Takes the raw title/content/
 * language rather than an item id, mirroring `generateAutoTags`/
 * `generateDescription` — the item drawer already has this data loaded, so
 * there's no need for a separate fetch-by-id round trip.
 *
 * Explanations aren't persisted; the drawer regenerates on each click.
 */
export async function explainCode(data: ExplainCodePayload): Promise<ActionResult<string>> {
  const parsed = explainCodeSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  if (isPlanGatingEnabled() && !session.user.isPro) {
    return { success: false, error: "AI features require a Pro plan" };
  }

  const rateLimit = await checkRateLimit(
    "ai-explain",
    session.user.id,
    EXPLAIN_RATE_LIMIT,
    EXPLAIN_RATE_WINDOW_SECONDS
  );
  if (!rateLimit.success) {
    return { success: false, error: retryAfterMessage(rateLimit.reset) };
  }

  try {
    const client = getOpenAIClient();
    const response = await client.responses.create({
      model: AI_MODEL,
      instructions:
        "You explain a developer's saved code snippet or terminal command, concisely, in about 200-300 words, covering what it does and any key concepts. Respond in Markdown with no preamble or closing remarks.",
      input: buildExplainInput(parsed.data),
    });

    const explanation = parseExplainResponse(response.output_text);
    if (!explanation) {
      return { success: false, error: "Couldn't generate an explanation. Please try again." };
    }

    return { success: true, data: explanation };
  } catch {
    return { success: false, error: "Something went wrong generating an explanation." };
  }
}
