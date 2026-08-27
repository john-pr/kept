# Portfolio Prep 3 — README Rewrite

## Overview

Replace the create-next-app boilerplate README with a portfolio-grade front page:
scannable in under two minutes, screenshots, live demo link, clear local setup.

## Requirements

- Sections, in order:
  - Hero: app name, tagline "Keep Everything. Find Anything.", badge row
    (CI status, license, "Live Demo →").
  - Live demo: URL + demo credentials (from user); note if demo data resets periodically.
  - Screenshot / GIF: a dashboard hero image + one short GIF (global search Cmd+K, or the
    homepage chaos→order animation). Store under `docs/images/`.
  - Features: grouped — Items & 7 types, Collections (many-to-many), Search / command
    palette, AI features (Pro: auto-tag, description, explain code, prompt optimizer),
    Auth (email/password + GitHub OAuth + verification/reset), Billing (Stripe + demo-Pro
    bypass), i18n (EN/FR/PL), theming (light/dark), Monaco + Markdown editors. Mention the
    Free/Pro gating model and that gating is flag-controlled.
  - Tech stack: table — Next 16 / React 19, TypeScript strict, Prisma 7 + Neon Postgres,
    NextAuth v5, Tailwind v4 (CSS config), shadcn / base-ui, Cloudflare R2, Upstash
    Redis, Stripe, OpenAI gpt-5-nano, next-intl, Vitest.
  - Architecture: 3–4 sentences + link to `docs/architecture.md`.
  - Getting started: prereqs; `cp .env.example .env` with a var-description table;
    `npm install`; `npm run db:migrate`; `npm run db:seed`; `npm run dev`.
  - Testing: `npm run test` (unit — server actions + lib, by design) and `npm run test:e2e`
    (Playwright smoke — added in spec 5).
  - Project structure: short `src/` tree.
  - How this was built: spec-driven + AI-assisted workflow; link `docs/specs/`,
    `docs/development-log.md`, `.claude/`.
  - License: MIT.
- Capture screenshots via Playwright MCP against the deployed URL (fallback: local
  `npm run dev` with a seeded DB). Minimum: dashboard, item drawer, global search,
  one AI feature.
- Verify `src/app/layout.tsx` `generateMetadata` has `description` + `openGraph` (fix in
  spec 6 if not) so the README's own social embed on GitHub looks right.

## Notes

- Depends on the demo URL + credentials. Branch: `docs/portfolio-restructure` (can share
  with spec 2) or `docs/readme`.
- Forward references: the CI badge (spec 4) and `npm run test:e2e` (spec 5) don't exist
  yet when this spec runs — write the README sections anyway; both will be broken/missing
  only until those specs land, and spec 7's checklist verifies them before going public.
