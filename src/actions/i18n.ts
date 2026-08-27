"use server";

import { cookies } from "next/headers";
import { requireSessionUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import {
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  isLocale,
  type Locale,
} from "@/lib/i18n";
import type { ActionResult } from "@/types/action-result";

/**
 * Persists an explicit locale choice: always a cookie (the single source
 * `src/i18n/request.ts` reads at request time), plus `User.locale` for a
 * signed-in user so the choice follows them across devices/sessions.
 */
export async function setLocale(locale: string): Promise<ActionResult<{ locale: Locale }>> {
  if (!isLocale(locale)) {
    return { success: false, error: "Unsupported locale" };
  }

  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, locale, {
    maxAge: LOCALE_COOKIE_MAX_AGE,
    sameSite: "lax",
    path: "/",
  });

  const user = await requireSessionUser();
  if (user) {
    await prisma.user.update({ where: { id: user.id }, data: { locale } });
  }

  return { success: true, data: { locale } };
}
