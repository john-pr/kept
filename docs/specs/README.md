# Feature Specs

Kept was built spec-first: every feature and redesign pass started as a short spec in this
folder, was implemented on its own branch, and was logged in
[`../development-log.md`](../development-log.md). These are the specs as written at the time —
lightly trimmed, not rewritten to match the final code.

Sub-500-byte stubs and course-scaffolding notes were dropped during the pre-public cleanup;
what remains is the substantive trail.

## Foundation

| Spec | Summary |
|---|---|
| [dashboard-phase-1-spec.md](dashboard-phase-1-spec.md) | Dashboard shell — routes, dark layout, top bar, sidebar/main placeholders |
| [dashboard-phase-2-spec.md](dashboard-phase-2-spec.md) | Collapsible sidebar, mobile drawer, brand in top bar |
| [dashboard-phase-3-spec.md](dashboard-phase-3-spec.md) | Stat cards, collections grid, pinned/recent item sections |
| [database-spec.md](database-spec.md) | Prisma 7 + Neon PostgreSQL schema and driver-adapter setup |
| [seed-spec.md](seed-spec.md) | Demo user, system item types, collections, idempotent seed script |
| [dashboard-collections-spec.md](dashboard-collections-spec.md) | Wire the collections grid to real Prisma data |
| [dashboard-items-spec.md](dashboard-items-spec.md) | Wire pinned/recent items to real Prisma data |
| [stats-sidebar-spec.md](stats-sidebar-spec.md) | Per-type counts and favorite/recent collections from real data |

## Auth

| Spec | Summary |
|---|---|
| [auth-phase-1-spec.md](auth-phase-1-spec.md) | NextAuth v5 split config, GitHub provider, route protection |
| [auth-phase-2-spec.md](auth-phase-2-spec.md) | Credentials provider, bcrypt, Zod-validated register route |
| [auth-phase-3-spec.md](auth-phase-3-spec.md) | Custom sign-in/register/sign-out UI, minimal profile page |
| [rate-limiting-spec.md](rate-limiting-spec.md) | Upstash sliding-window rate limiting on sensitive auth endpoints |
| [profile-spec.md](profile-spec.md) | Full profile page — stats, change-password, delete-account |

## Items & collections

| Spec | Summary |
|---|---|
| [item-drawer-spec.md](item-drawer-spec.md) | Fast item view in a side drawer |
| [item-drawer-edit-spec.md](item-drawer-edit-spec.md) | Inline edit mode in the drawer — the first server action |
| [item-create-spec.md](item-create-spec.md) | New Item dialog + `createItem`/`deleteItem` actions |
| [code-editor-spec.md](code-editor-spec.md) | Monaco-based editor for snippet/command content |
| [markdown-editor-spec.md](markdown-editor-spec.md) | Write/Preview markdown editor for prompt/note content |
| [file-image-spec.md](file-image-spec.md) | File & image upload via Cloudflare R2 |
| [pagination-spec.md](pagination-spec.md) | Windowed pagination across item/collection lists |
| [global-search-spec.md](global-search-spec.md) | Cmd/Ctrl+K command palette over items and collections |
| [favorites-spec.md](favorites-spec.md) | Favorites page with sortable item/collection lists |
| [pinned-spec.md](pinned-spec.md) | Pin items to the top of their lists |
| [editor-settings-spec.md](editor-settings-spec.md) | Per-user editor preferences persisted on the User row |

## Billing

| Spec | Summary |
|---|---|
| [stripe-phase-1-spec.md](stripe-phase-1-spec.md) | Schema fields, Stripe client, `isPro` plumbing, plan-limits module |
| [stripe-phase-2-spec.md](stripe-phase-2-spec.md) | Checkout, webhook handler, Customer Portal, billing UI, enforcement |

## AI (Pro)

| Spec | Summary |
|---|---|
| [ai-auto-tag-spec.md](ai-auto-tag-spec.md) | First AI feature — tag suggestions via the OpenAI Responses API |
| [ai-explain-spec.md](ai-explain-spec.md) | "Explain this code" in the drawer's code view |

## Marketing & redesign

| Spec | Summary |
|---|---|
| [homepage-mockup-spec.md](homepage-mockup-spec.md) | Static standalone homepage prototype |
| [homepage-spec.md](homepage-spec.md) | The real marketing homepage wired into the app |
| [homepage-redesign-spec.md](homepage-redesign-spec.md) | Repositioning + moving `/` onto the "ledger" design system |
| [topbar-footer-theme-spec.md](topbar-footer-theme-spec.md) | Top bar / user footer restyle + light/dark toggle |
