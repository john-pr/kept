# Portfolio Prep 5 — Playwright E2E Smoke Suite

## Overview

Add a small end-to-end smoke suite to demonstrate testing maturity beyond the existing
unit tests. Breadth over depth — cover the main user journeys, not every edge.

## Requirements

- Add `@playwright/test` as a devDependency. Add `playwright.config.ts` (baseURL from env,
  `webServer` running `npm run dev` for local runs, chromium project).
- `tests/e2e/`:
  - `home.spec.ts` — `/` renders; theme toggle flips `<html>` class; Features / Pricing
    nav anchors resolve.
  - `auth.spec.ts` — register a throwaway user → sign in → land on `/dashboard`.
  - `items.spec.ts` — create a snippet via the New Item dialog → it appears in the list →
    open its drawer → toggle favorite → reload → favorite persisted.
  - `search.spec.ts` — Cmd/Ctrl+K opens the palette → type a query → a result appears →
    selecting an item opens its drawer.
- `package.json` scripts: `test:e2e` (`playwright test`), `test:e2e:ui`
  (`playwright test --ui`).
- Runs against a locally seeded dev DB (`npm run db:migrate && npm run db:seed`); document
  this in the README testing section. CI wiring is spec 4's `e2e.yml`.
- Environment prerequisites for the auth flow (document in README + assert in a global
  setup or skip with a clear message if unmet):
  - `EMAIL_VERIFICATION_ENABLED=false` — otherwise `auth.spec.ts`'s register → sign-in
    flow is blocked by the verification interstitial (Credentials `authorize` rejects
    unverified users when the flag is on).
  - Leave `UPSTASH_REDIS_REST_URL`/`TOKEN` unset for E2E runs (rate limiting fails open
    when unconfigured) — the login limiter is 5/15min per IP, which repeated local runs
    would trip.
- Throwaway users accumulate in the shared Neon `development` branch; `npm run db:cleanup`
  (`scripts/delete-non-demo-users.ts`) already exists — use a recognizable e2e email
  prefix and mention the cleanup script in the README testing section.
- Do NOT touch `vitest.config.ts` — E2E lives outside the Vitest globs. Unit-test policy
  (only `src/actions` + `src/lib`) is unchanged; this is purely additive.
- `.gitignore` already covers `/playwright-report/` and `/test-results/` from spec 1.

## Notes

- Branch: `test/e2e-smoke`.
