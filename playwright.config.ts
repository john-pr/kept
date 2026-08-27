import { defineConfig, devices } from "@playwright/test";

/**
 * E2E smoke suite. Breadth over depth — the main user journeys, not every edge.
 *
 * Runs against a local dev server with a seeded database:
 *   npm run db:migrate && npm run db:seed
 *   npm run test:e2e
 *
 * `global-setup.ts` asserts the environment prerequisites (see that file). CI wiring is
 * portfolio-prep 4's `e2e.yml`.
 */

const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./tests/e2e",
  globalSetup: "./tests/e2e/global-setup.ts",
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["html", { open: "never" }], ["list"]] : "list",
  timeout: 30_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],

  webServer: {
    command: "npm run dev",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      // Rate limiting fails open when Upstash is unconfigured; blank it for E2E so
      // repeated local runs don't trip the 5-per-15-min login limiter.
      UPSTASH_REDIS_REST_URL: "",
      UPSTASH_REDIS_REST_TOKEN: "",
      // Register -> sign-in must not hit the verification interstitial.
      EMAIL_VERIFICATION_ENABLED: "false",
    },
  },
});
