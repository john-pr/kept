import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getEditorPreferences } from "@/lib/db/users";
import { DEFAULT_EDITOR_PREFERENCES } from "@/lib/editor-preferences";

// EditorPreferencesProvider is mounted globally (root layout) so it can fetch
// on mount from public pages (sign-in, register, etc.) too — return the
// defaults there instead of 401ing, since there's no user to load prefs for.
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: true, data: DEFAULT_EDITOR_PREFERENCES });
  }

  const preferences = await getEditorPreferences(session.user.id);
  return NextResponse.json({ success: true, data: preferences });
}
