# Portfolio Prep 4 — GitHub Project Furniture

## Overview

Add the standard open-source repo scaffolding: license, CI, contribution templates,
dependency automation, and repo metadata.

## Requirements

- `LICENSE`: MIT (holder name + year from user — assume "Jan Przybysz" / 2026). Add
  `"license": "MIT"` to `package.json`.
- `.github/workflows/ci.yml`: on push + PR to `master`. Node 20, `npm ci`, then
  `npm run lint`, `npx tsc --noEmit`, `npm run test`. Enable npm cache. This is the
  target of the README CI badge.
- `.github/workflows/e2e.yml`: PR-only (keep Actions minutes low). **A plain `postgres:16`
  service container will NOT work**: `src/lib/prisma.ts` uses `PrismaNeon` +
  `@neondatabase/serverless` over WebSocket, which only speaks to a Neon-style proxy, not
  raw TCP Postgres. Pick one (in order of preference):
  1. Point `DATABASE_URL` at a **dedicated Neon branch** for CI (e.g. a new `ci` branch of
     the existing `devstash` Neon project), stored as a repo secret — zero code changes.
  2. Run Neon's local proxy (`ghcr.io/neondatabase/wsproxy`) as a second service container
     in front of `postgres:16`, with `neonConfig` env-gated to target it — extra setup +
     a small code change in `prisma.ts`.
  Then `npm run db:migrate:deploy` + `npm run db:seed`; `npm run build` then
  `npm run start &`; `npx playwright test`. Upload `playwright-report/` as an artifact.
  (Decision point: enable now, or land spec 5 as local-only first and add this job in a
  follow-up.)
- `.github/ISSUE_TEMPLATE/bug_report.md`, `.github/ISSUE_TEMPLATE/feature_request.md`,
  `.github/ISSUE_TEMPLATE/config.yml`.
- `.github/PULL_REQUEST_TEMPLATE.md`.
- `.github/dependabot.yml`: npm ecosystem, weekly, grouped minor/patch.
- `CONTRIBUTING.md`: short — branch naming, run build/lint/test before commit, conventional
  commits (mirror `context/ai-interaction.md`). Skip CODE_OF_CONDUCT unless requested.
- Repo metadata via `gh repo edit john-pr/kept`: set description, `--homepage <demo-url>`,
  and topics: `nextjs react typescript prisma tailwindcss nextauth stripe openai
  developer-tools portfolio`. Add a social-preview image (reuse the OG image from spec 6).

## Notes

- Branch: `chore/github-furniture`. `ci.yml` must pass on its own introducing PR.
