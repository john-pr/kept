# Item CRUD Architecture

Design for a unified create/read/update/delete system covering all 7 item types (Snippet, Prompt, Command, Note, Link, File, Image), following the conventions already established in this codebase (`context/coding-standards.md`, `context/ai-interaction.md`) and the existing dashboard data layer.

> Note on sources: the research prompt referenced `docs/content-types.md` and `src/lib/constants.tsx` — neither exists. The actual equivalent is `docs/item-types.md` (written in a prior research pass) and type metadata lives in the DB (`ItemType` table, seeded by `prisma/seed.ts`), resolved at runtime via `src/lib/icon-map.ts`. This doc uses those as the real sources.

## Why one route + one action file works

All 7 types share a single `Item` model (`prisma/schema.prisma:92-119`) with the same columns — `content`, `url`, `fileUrl`/`fileName`/`fileSize`, `description`, `language`, etc. — all nullable and reused across types. Nothing at the schema or mutation level actually differs between a Snippet and a Link; only *which fields are populated* and *how they're displayed* differs. That's what makes a single generic CRUD layer viable: the type-specific behavior is a display/validation concern, not a persistence concern.

`getItemTypes()` (`src/lib/db/items.ts:15-36`) already produces a `slug` per type (e.g. `snippets`, `links`, `files`) — this is the intended param for the dynamic route.

## File Structure

```
src/
  actions/
    items.ts              # createItem, updateItem, deleteItem — Server Actions, one file for all types
  lib/
    db/
      items.ts             # existing: getItemTypes, getPinnedItems, getRecentItems
                            # + new: getItemBySlspecies... see "Data Fetching" below
      item-schemas.ts       # new: per-type Zod schemas + a shared base schema
  app/
    items/
      [type]/
        page.tsx            # list view for one item type, e.g. /items/snippets
  components/
    items/
      ItemForm.tsx           # create/edit form, adapts fields shown based on `itemType.name`
      ItemDrawer.tsx          # create/view/edit drawer (per project-overview.md §3.1)
      ItemDetail.tsx          # read-only type-specific render (code block, link preview, file/image preview)
      ItemList.tsx             # grid of ItemCard for /items/[type], reuses existing ItemCard
    dashboard/
      ItemCard.tsx            # existing — unchanged, already type-agnostic (color/icon driven)
```

This mirrors the existing pattern used by auth (`src/app/api/auth/register/route.ts` for a one-off mutation) and dashboard (`src/lib/db/*.ts` for server-component reads) — just consolidated per-domain instead of per-feature, since all 7 types are one domain.

## Mutations: `src/actions/items.ts`

One file, three exported Server Actions, per `context/coding-standards.md` ("Use Server Actions for form submissions and simple mutations") and the `{ success, data, error }` return pattern already used by the auth API routes:

```ts
"use server";

export async function createItem(input: CreateItemInput): Promise<ActionResult<Item>>
export async function updateItem(id: string, input: UpdateItemInput): Promise<ActionResult<Item>>
export async function deleteItem(id: string): Promise<ActionResult<void>>
```

- `CreateItemInput`/`UpdateItemInput` are validated with Zod (`item-schemas.ts`) — a shared base schema (`title`, `itemTypeId`, `tags`, `collectionIds`) plus conditional refinement based on the resolved `ItemType.name` (e.g. `url` required when type is "link", `content` required for text types, `fileUrl` required for file/image). Zod's `.superRefine` or a discriminated union keyed by type name is the natural fit.
- Actions call `prisma` directly (no separate repository layer needed — matches how `src/app/api/auth/*` routes call Prisma inline).
- Actions do **not** contain any type-specific *display* logic (no icon/color/formatting decisions) — only validation of which fields are required for which type, which is a data-integrity concern, not a UI concern.
- Ownership check (`item.userId === session.user.id`) happens in `updateItem`/`deleteItem` before mutating, consistent with how `change-password`/`delete-account` routes verify the session user (`src/app/api/auth/change-password/route.ts` pattern).
- File/Image creation: the action receives an already-uploaded `fileUrl`/`fileName`/`fileSize` (upload itself happens via a separate API route per `coding-standards.md`'s guidance that file uploads with progress tracking belong in API routes, not Server Actions) — `createItem` just persists the reference.

## Data Fetching: `src/lib/db/items.ts`

Extends the existing file rather than creating a parallel one, consistent with how `getPinnedItems`/`getRecentItems`/`getItemTypes` already live together. New functions needed for the list route:

```ts
export async function getItemsByTypeSlug(slug: string, opts?: { search?: string }): Promise<ItemSummary[]>
export async function getItemTypeBySlug(slug: string): Promise<ItemTypeSummary | null>
export async function getItemById(id: string): Promise<ItemDetail | null>
```

- `getItemsByTypeSlug` reverses the pluralization done in `getItemTypes()` (or stores `slug` as a real column later) to filter `Item.where.itemType.name`.
- Called directly from the `/items/[type]` server component — no API route needed for reads, per `coding-standards.md`: "Server components fetch directly with Prisma" / "Otherwise, fetch data directly in server components."
- `ItemDetail` (a fuller shape than the dashboard's `ItemSummary`) includes all nullable fields (`url`, `fileUrl`, `language`, etc.) needed for the drawer/detail view — `ItemSummary` stays lightweight for card grids.

## Routing: `/items/[type]`

```
src/app/items/[type]/page.tsx
```

- `type` param is the slug already produced by `getItemTypes()` (e.g. `snippets`, `commands`, `files`).
- Server component: calls `getItemTypeBySlug(type)` to resolve color/icon/name (404 via `notFound()` if unknown slug or not a system type), then `getItemsByTypeSlug(type)`.
- Renders a page header (type name/icon/color, matching the existing sidebar nav entries in `SidebarNav.tsx`) + `ItemList` grid + an "Add [Type]" button that opens `ItemDrawer` in create mode.
- One route file serves all 7 types — no per-type route folders. This matches `context/project-overview.md` §8's routing table (`/items/snippets`, `/items/links`, etc. — all instances of the same pattern) and avoids duplicating 7 nearly-identical page components.
- Pro gating (File/Image) is enforced here: if `getItemTypeBySlug` resolves `isPro: true` and the session user's `isPro` is false, render an upgrade prompt instead of the list (mirrors the "infrastructure for Pro gating in place" note in `project-overview.md` §6).

## Where Type-Specific Logic Lives (components, not actions)

| Concern | Type-specific? | Where |
|---|---|---|
| Which fields are required to save | Yes | `item-schemas.ts` (validation only) |
| Persisting fields to DB | No — same `prisma.item.create/update` call for all types | `actions/items.ts` |
| Icon/color | No — always resolved from `itemType.icon`/`itemType.color` | `icon-map.ts` (existing) |
| Form fields shown (e.g. `language` dropdown for Snippet, `url` input for Link, file picker for File/Image) | Yes | `ItemForm.tsx` — switches on `itemType.name` |
| Detail/preview rendering (syntax-highlighted code, link card, image thumbnail) | Yes | `ItemDetail.tsx` — switches on `itemType.name` |
| Card summary (grid view) | No — already type-agnostic today | `ItemCard.tsx` (existing, unchanged) |
| Pro-tier access check | Yes (File/Image only) | route `page.tsx` + `ItemDrawer.tsx` (disable create action) |

The rule of thumb: **actions and `lib/db` stay generic over `Item`; only components branch on `itemType.name`.** This keeps the mutation/query surface small (3 actions, a handful of queries) while all the type-count growth (if custom types are added later, per `project-overview.md` §9) only touches components and the schema's conditional validation — not the CRUD plumbing itself.

## Component Responsibilities

- **`ItemForm`** — controlled form, receives `itemType` (for field switching) and optional existing `item` (edit mode). Calls `createItem`/`updateItem`. Owns client-side Zod validation mirroring `item-schemas.ts` (same pattern as `RegisterForm.tsx` validating client-side before hitting the server).
- **`ItemDrawer`** — thin wrapper (shadcn `Sheet`, already used for `MobileSidebar`) that hosts either `ItemForm` (create/edit) or `ItemDetail` (view), per `project-overview.md` §3.1's "opens in a drawer for fast access."
- **`ItemDetail`** — read-only, type-aware rendering: code block w/ syntax highlighting for Snippet, rendered markdown for Note/Prompt, clickable link + fetched-or-stored description for Link, `<pre>` for Command, image/file preview + download link for Image/File.
- **`ItemList`** — grid layout, maps `ItemSummary[]` to existing `ItemCard`, handles empty state and (future) search/filter within the type.
- **`ItemCard`** — unchanged; already fully type-agnostic via `typeIcon`/`typeColor`.

## Summary Diagram

```
Server Component (/items/[type]/page.tsx)
   ├─ lib/db/items.ts: getItemTypeBySlug, getItemsByTypeSlug   (reads, direct Prisma)
   └─ components/items/ItemList → ItemCard (existing, type-agnostic)
        └─ ItemDrawer (Sheet)
             ├─ ItemForm  (type-aware fields) ──calls──> actions/items.ts: createItem/updateItem
             └─ ItemDetail (type-aware display)
                                                    actions/items.ts: deleteItem
                                                       └─ prisma.item.delete (generic, ownership-checked)
```