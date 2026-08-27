# Item Types

DevStash ships with 7 fixed system item types. They are seeded as `ItemType` rows (`isSystem: true`, `userId: null`) in `prisma/seed.ts` and are immutable/system-owned — user-defined custom types are a post-launch feature (see `context/project-overview.md` §9).

## The 7 Types

| Type | Icon (lucide) | Hex Color | Tier | Content Kind | Purpose |
|---|---|---|---|---|---|
| Snippet | `Code` | `#3b82f6` (blue) | Free | text | Reusable code snippets, often with a `language` tag for syntax highlighting |
| Prompt | `Sparkles` | `#8b5cf6` (purple) | Free | text | Saved AI prompts (ChatGPT/Claude, etc.) |
| Command | `Terminal` | `#f97316` (orange) | Free | text | Shell/CLI commands |
| Note | `StickyNote` | `#fde047` (yellow) | Free | text | Freeform notes |
| Link | `Link` | `#10b981` (emerald) | Free | url | Bookmarked URLs with a description |
| File | `File` | `#6b7280` (gray) | Pro | file | Uploaded files (Cloudflare R2) |
| Image | `Image` | `#ec4899` (pink) | Pro | file | Uploaded images (Cloudflare R2) |

Seed IDs: `type-snippet`, `type-prompt`, `type-command`, `type-note`, `type-file`, `type-image`, `type-link` (`prisma/seed.ts:13-21`).

## Where Types Are Defined in Code

- **Schema** (`prisma/schema.prisma:78-90`) — `ItemType` model: `id`, `name`, `icon` (string key), `color` (hex string), `isSystem`, optional `userId` (null = system type).
- **Seed data** (`prisma/seed.ts:13-21`) — the canonical source for name/icon/color per type; upserted into the DB (not hardcoded elsewhere).
- **Icon resolution** (`src/lib/icon-map.ts`) — `iconMap: Record<string, LucideIcon>` maps the `ItemType.icon` string (e.g. `"Code"`) to the actual Lucide component. Only the 7 icons above are registered.
- **Pro gating** (`src/lib/db/items.ts`) — `getItemTypes()` derives `isPro` at query time via `PRO_TYPE_NAMES = new Set(["file", "image"])`, matched against the lowercased `ItemType.name`. This is *not* a DB column — it's computed in application code from the name string.
- **No `src/lib/constants.tsx` exists** — type metadata (name/icon/color) lives in the database (seeded), not in a static constants file.

## Text vs. File vs. URL Classification

The `Item` model (`prisma/schema.prisma:92-119`) has a single `contentType: ContentType` enum (`TEXT | FILE`) plus a set of optional fields shared across all types:

| Field | Used by |
|---|---|
| `content` | Snippet, Prompt, Command, Note (text body) |
| `language` | Snippet only (optional, for syntax highlighting) |
| `url` | Link (target URL) |
| `description` | Link (and generally optional elsewhere) |
| `fileUrl`, `fileName`, `fileSize` | File, Image (R2 object reference) |

Observations:
- **Link** items are stored with `contentType: TEXT` in seed data even though they carry a `url` rather than a `content` body — the schema does not have a distinct `URL` content type. The project overview's "Content Kind: url" (§3.1) is a conceptual classification, not a literal enum value; at the DB level it collapses into `TEXT`.
- **File/Image** are the only types that use `contentType: FILE` and the `fileUrl`/`fileName`/`fileSize` fields.
- **Snippet/Prompt/Command/Note** are all `contentType: TEXT` and differ only by `itemType` (color/icon) and, for Snippet, the optional `language` field.

## Shared Properties (all types)

Every `Item` regardless of type has: `title`, `isFavorite`, `isPinned`, `createdAt`/`updatedAt`, `userId`, `itemTypeId`, `tags` (many-to-many), and `collections` (many-to-many via `ItemCollection`).

## Display Differences (current implementation)

As of this research, `ItemCard.tsx` (`src/components/dashboard/ItemCard.tsx`) renders all item types identically:
- A colored ring (`item.typeColor`) and icon (`item.typeIcon` resolved via `iconMap`) in the header.
- Title, a 2-line clamped monospace preview of `item.content`, and tags.

There is **no type-specific rendering yet** — e.g. Link items don't render their `url`/favicon, File/Image items don't render a thumbnail or file-size badge, and Snippet items don't show `language` or syntax-highlighted code on the card. This differentiation is expected to land with the item drawer / detail view (not yet implemented per `context/project-overview.md` §3.1, "Items are created and viewed in a **drawer**").

The only visual differentiation currently live is the **per-type color** (ring border + icon tint), consistent across dashboard `ItemCard`, `CollectionCard` (border color from dominant type), and `SidebarNav` (colored dot for recent collections, PRO badge for File/Image nav items).