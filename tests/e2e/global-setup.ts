import "dotenv/config";

/**
 * Fails the whole run early if the environment can't support the auth journey, rather than
 * letting `auth.spec.ts` time out on the email-verification interstitial.
 *
 * Prerequisites (also documented in the README "Testing" section):
 *  - EMAIL_VERIFICATION_ENABLED must be "false" — Credentials `authorize` rejects unverified
 *    users when it's on, so register -> sign-in never reaches /dashboard.
 *  - UPSTASH_REDIS_REST_URL / _TOKEN should be unset for E2E — the login limiter is
 *    5/15min per IP and repeated local runs would trip it. `playwright.config.ts` blanks
 *    them for the server it starts; this only warns if they're set in the runner env.
 */
export default async function globalSetup() {
  if (process.env.EMAIL_VERIFICATION_ENABLED === "true") {
    throw new Error(
      "E2E: set EMAIL_VERIFICATION_ENABLED=false in .env — the register -> sign-in flow " +
        "in auth.spec.ts is blocked by the verification interstitial when it's on.",
    );
  }

  if (process.env.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.warn(
      "[e2e] Upstash rate limiting is configured in this env. `playwright.config.ts` " +
        "blanks it for the server it starts, but a reused dev server keeps it active — " +
        "repeated runs may hit the 5-per-15-min login limiter.",
    );
  }
}
