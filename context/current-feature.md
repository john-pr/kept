# Current Feature
None — awaiting next feature/fix.
## Status
N/A
## Goals
N/A
## Notes
N/A
## History
[//]: # (keep this updated. earliest to latest)
- 2026-05-20: Initial Next.js setup via Create Next App
- 2026-07-06: Started Dashboard UI Phase 1
- 2026-07-06: Completed Dashboard UI Phase 1 — shadcn/ui init, /dashboard route, dark-mode-default layout, top bar with search + new item/collection buttons, sidebar/main placeholders. Build and lint pass.
- 2026-07-06: Documented Dashboard UI Phase 2 spec
- 2026-07-06: Completed Dashboard UI Phase 2 — collapsible sidebar (desktop) with item types, favorite/recent collections, user footer, and "Navigation" header; mobile drawer sidebar via Sheet; DevStash brand moved to top bar with responsive mobile layout (icon-only actions + full-width search). Build and lint pass.
- 2026-07-06: Documented Dashboard UI Phase 3 spec
- 2026-07-06: Completed Dashboard UI Phase 3 — stats cards (total items/collections, favorite items/collections), recent collections grid, pinned items and recent items sections with item cards; contained scrolling (sidebar fixed, main scrolls independently); "Dashboard" title and centered max-width content area. Build and lint pass.
- 2026-07-06: Documented Prisma + Neon PostgreSQL setup spec
- 2026-07-06: Completed Prisma + Neon PostgreSQL setup — Prisma 7 schema (app models + NextAuth models) with driver adapter (@prisma/adapter-neon), prisma.config.ts, initial migration applied to Neon dev branch, and prisma/seed.ts translating mock-data.ts into seeded rows. UI still reads from mock-data.ts (not yet wired to Prisma). Build and lint pass.
- 2026-07-07: Documented Seed Data spec
- 2026-07-07: Completed Seed Data — added `password` field to User (migration), `bcryptjs` dep, rewrote `prisma/seed.ts` with demo user/item types/collections/items per spec, made item-collection linking idempotent, and updated `scripts/test-db.ts` to display demo data. Build and lint pass.
- 2026-07-07: Documented Dashboard Collections spec
- 2026-07-07: Completed Dashboard Collections — added `src/lib/db/collections.ts` fetching collections with items/itemTypes via Prisma; `CollectionsSection` now an async server component using real Neon data instead of mock-data; `CollectionCard` shows a border colored by the most-used item type and icons for all types present. Items under collections still deferred. Build and lint pass.