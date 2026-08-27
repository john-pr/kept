import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { LOCALE_COOKIE, resolveLocale } from "@/lib/i18n";

/**
 * Feeds `next-intl` the active locale + messages for every request. No locale
 * lives in the URL — an explicit choice is stored in the `locale` cookie
 * (mirrored to `User.locale` for signed-in users), and first-time visitors are
 * matched from their `Accept-Language` header.
 */
export default getRequestConfig(async () => {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);

  const locale = resolveLocale({
    cookieValue: cookieStore.get(LOCALE_COOKIE)?.value,
    acceptLanguage: headerStore.get("accept-language"),
  });

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
