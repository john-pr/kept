import { auth } from "@/auth";

/**
 * Resolves the current session's user id without a DB round-trip
 * (session uses the JWT strategy, so this is a token decode only).
 *
 * Use this to kick off userId-scoped queries in parallel with
 * `getCurrentUser()` instead of awaiting `getCurrentUser()` first.
 */
export async function getSessionUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("No authenticated user");
  }
  return session.user.id;
}
