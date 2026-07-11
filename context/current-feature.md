# Current Feature
Dashboard Quick Fixes (code-scanner audit follow-up)
## Status
In Progress
## Goals
Low-risk cleanup items identified by the code-scanner audit on 2026-07-11:
1. **Fix duplicate `getRecentCollections(6)` query (N+1)** — `dashboard/page.tsx` and `CollectionsSection.tsx` both independently call `getRecentCollections(6)`, doubling a Prisma query with nested `items.item.itemType` joins on every dashboard load. Fetch once in `dashboard/page.tsx` and pass the result into `CollectionsSection` as a prop, matching the existing pattern for `itemTypes`/`favoriteCollections`/`user`.
2. **Add a `take` limit to `getPinnedItems`** — unlike `getRecentItems`, it has no cap, so pinned-item lists are unbounded as they grow. Add a reasonable `take` limit consistent with `getRecentItems`.
3. **Fix dead `line-clamp-2` in `ItemCard.tsx`** — `truncate` and `line-clamp-2` are combined on the same `<p>` (line 33); `truncate` forces single-line ellipsis and overrides the clamp. Drop `truncate`, keep only `line-clamp-2`.
## Notes
Deferred from audit (not included — higher risk/scope): `ItemSummary.content` field conflation (content/url/description merged into one string) and wiring up the `TopBar` search input.
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