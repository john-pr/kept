"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { getOpenAIClient, AI_MODEL } from "@/lib/openai";
import { buildAutoTagInput, parseAutoTagResponse } from "@/lib/auto-tag";
import { isPlanGatingEnabled } from "@/lib/plan-limits";
import { checkRateLimit, retryAfterMessage } from "@/lib/rate-limit";

const AUTO_TAG_RATE_LIMIT = 20;
const AUTO_TAG_RATE_WINDOW_SECONDS = 3600;

const generateAutoTagsSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  content: z.string().nullable(),
});

export type GenerateAutoTagsPayload = z.infer<typeof generateAutoTagsSchema>;

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
