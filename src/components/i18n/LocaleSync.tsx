"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { setLocale } from "@/actions/i18n";
import { isLocale } from "@/lib/i18n";

/**
 * Reconciles the request-time locale (cookie / `Accept-Language`) with the
 * signed-in user's saved `User.locale` so their choice follows them onto a new
 * device or browser where no cookie exists yet. Runs once: if they disagree, it
 * writes the account preference to the cookie and refreshes. Renders nothing.
 */
export function LocaleSync({ userLocale }: { userLocale: string | null }) {
  const activeLocale = useLocale();
  const router = useRouter();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;
    if (isLocale(userLocale) && userLocale !== activeLocale) {
      setLocale(userLocale).then(() => router.refresh());
    }
  }, [userLocale, activeLocale, router]);

  return null;
}
