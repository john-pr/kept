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
- 2026-07-07: Documented Dashboard Items spec
- 2026-07-07: Completed Dashboard Items — added `src/lib/db/items.ts` (`getPinnedItems`, `getRecentItems`) and `src/lib/db/stats.ts` (`getDashboardStats`) using Prisma; `PinnedItemsSection`, `RecentItemsSection`, and `StatsCards` are now async server components reading real Neon data instead of mock-data; `ItemCard` border/icon color now derived from item type. Removed unused `src/lib/dashboard.ts`. Build and lint pass.
- 2026-07-07: Documented Stats & Sidebar spec
- 2026-07-07: Completed Stats & Sidebar — added `getItemTypes()` (with per-type item counts, sorted most-to-least) to `src/lib/db/items.ts` and `getFavoriteCollections()` to `src/lib/db/collections.ts`; `SidebarNav` is now prop-driven from real Neon data (item types link to `/items/[slug]`, favorite collections keep the star icon, recent collections show a colored circle from their dominant item type, plus a new "View all collections" link to `/collections`); data is fetched once in `dashboard/page.tsx` and threaded through `Sidebar`/`MobileSidebar`/`TopBar`. Marked "React Patterns" and "DevOps" as favorite collections in `prisma/seed.ts` and fixed the seed's collection upsert (previously a no-op on existing rows) so favorite/name/description changes apply on re-seed. Stats cards were already wired to Neon from a prior feature. Build and lint pass.
- 2026-07-10: Documented Add Pro Badge to Sidebar spec
- 2026-07-10: Completed Add Pro Badge to Sidebar — added `isPro` flag to `ItemTypeSummary` (`src/lib/db/items.ts`), derived from type name being "file"/"image"; `SidebarNav.tsx` renders a subtle outline shadCN `Badge` reading "PRO" next to the (now pluralized, e.g. "Snippets"/"Links") item type name when expanded, and a small dot indicator on the icon when collapsed; `src/app/page.tsx` now redirects `/` to `/dashboard` instead of showing the CNA placeholder. Build and lint pass.
- 2026-07-11: Documented Dashboard Quick Fixes spec (code-scanner audit follow-up)
- 2026-07-11: Completed Dashboard Quick Fixes — fixed duplicate `getRecentCollections(6)` query by fetching once in `dashboard/page.tsx` and passing it into `CollectionsSection` as a prop instead of a second self-fetch; added a `take` limit (default 10) to `getPinnedItems` in `src/lib/db/items.ts`, matching `getRecentItems`; removed the `truncate` class from `ItemCard.tsx` that was overriding `line-clamp-2`. Build and lint pass.
- 2026-07-28: Documented Auth Setup (NextAuth + GitHub Provider) spec, Phase 1
- 2026-07-28: Completed Auth Setup Phase 1 — installed `next-auth@beta` (5.0.0-beta.32) and `@auth/prisma-adapter`; added split config pattern (`src/auth.config.ts` edge-safe providers-only, `src/auth.ts` full config with Prisma adapter + JWT strategy + session/jwt callbacks exposing `user.id`); added `src/app/api/auth/[...nextauth]/route.ts` handlers; added `src/proxy.ts` protecting `/dashboard/*` via matcher, redirecting unauthenticated requests to `/api/auth/signin` with callbackUrl; added `src/types/next-auth.d.ts` extending Session with `user.id`. Verified in browser: unauthenticated `/dashboard` redirects to default sign-in page with GitHub button. Also added `.mcp.json` to `.gitignore` (contained a live Context7 API key that should not be committed). Build and lint pass.