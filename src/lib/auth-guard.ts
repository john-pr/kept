import { NextResponse } from "next/server";
import { auth } from "@/auth";
import type { Session } from "next-auth";

/**
 * Resolves the current session's user for server actions, or `null` if
 * unauthenticated. Collapses the `auth()` + optional-chain check repeated
 * at the top of every server action into one call.
 *
 * Unlike `getSessionUserId` (`src/lib/db/session.ts`), this never throws —
 * server actions return `{ success: false, error }` on a missing session
 * rather than propagating an exception.
 */
export async function requireSessionUser(): Promise<Session["user"] | null> {
  const session = await auth();
  return session?.user?.id ? session.user : null;
}

/**
 * Same as `requireSessionUser`, but for API route handlers: returns a
 * pre-built 401 `NextResponse` instead of `null` on a missing session, so
 * callers can `return` it directly. Collapses the `auth()` + optional-chain
 * check + 401 response repeated at the top of every session-authenticated
 * route handler into one call:
 * ```ts
 * const user = await requireApiSessionUser();
 * if (user instanceof NextResponse) return user;
 * ```
 */
export async function requireApiSessionUser(): Promise<Session["user"] | NextResponse> {
  const user = await requireSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
  }
  return user;
}
