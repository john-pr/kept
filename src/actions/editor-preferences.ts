"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { updateEditorPreferences as updateEditorPreferencesQuery } from "@/lib/db/users";
import { EDITOR_THEMES, type EditorPreferences } from "@/lib/editor-preferences";
import type { ActionResult } from "@/types/action-result";

const editorPreferencesSchema = z.object({
  fontSize: z.number().int().positive(),
  tabSize: z.number().int().positive(),
  wordWrap: z.boolean(),
  minimap: z.boolean(),
  theme: z.enum(EDITOR_THEMES),
});

export async function updateEditorPreferences(
  data: EditorPreferences
): Promise<ActionResult<EditorPreferences>> {
  const parsed = editorPreferencesSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const updated = await updateEditorPreferencesQuery(session.user.id, parsed.data);
  return { success: true, data: updated };
}
