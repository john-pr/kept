# Current Feature

## Status

In progress — Portfolio Prep: demo-account mock data (`chore/demo-seed`).

## Goals

- A standalone, idempotent `scripts/seed-demo.ts` that populates the public demo
  account with realistic mock data, run once against the production Neon branch
  during deploy.
- Demo user `demo@kept.app` / password `12345678`, `isPro: true`, `emailVerified` set
  (plan gating is ON in production, so Free would hide File/Image/AI/export).
- ~6 collections, ~35 text items across snippet / prompt / command / note / link.
  A few pinned, ~10 favorited, timestamps spread over ~3 months, 4-5 items in
  multiple collections to show the M2M relationship.
- Re-runnable: upsert by stable `demo-*` ids; also upserts the 7 system `ItemType`
  rows so it works on a fresh production DB.

## Notes

- File and Image items are deliberately out of scope — they need real R2 uploads;
  the user will add a few by hand after the seed.
- Independent of `prisma/seed.ts` (the dev seed, `demo@kept.app` on the development
  branch). This script targets production and is invoked explicitly, not via
  `prisma db seed`.
- New `npm run db:seed:demo` script (mirrors the existing `db:cleanup` tsx pattern).
- Not run from this machine — executed against production at deploy time (Prep 7).

## History

[//]: # (The full development log now lives in docs/development-log.md — earliest to latest.)
[//]: # (Add each completed feature there, in the format its header prescribes, once merged.)
