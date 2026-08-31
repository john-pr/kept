# Development Log

A running record of how Kept was built, newest section last. Each entry names what shipped,
the key files, any non-obvious decision or deviation, anything deliberately deferred, and any
real bug found along the way. Routine "build/lint/test passed, merged, branch deleted" steps
are implied and not logged. Full detail for any entry is in the git history.

Moved here from `context/current-feature.md` during the pre-public docs restructure and
compressed to the format above.

---

## May 2026 — kickoff

- **2026-05-20 — Project init.** Next.js 16 / React 19 / TypeScript via Create Next App.

## July 2026 — dashboard, database, auth

- **2026-07-06 — Dashboard UI, phases 1–3.** shadcn/ui init; `/dashboard` route; dark-mode-default
  layout; `TopBar` with search + new-item/collection buttons; collapsible desktop sidebar (item
  types, favorite/recent collections, user footer) with a mobile `Sheet` drawer; stat cards,
  recent-collections grid, and pinned/recent item sections. Sidebar and main scroll independently.
- **2026-07-06 — Prisma + Neon setup.** Prisma 7 schema (app + NextAuth models) with the driver
  adapter; initial migration on the Neon dev branch; `prisma/seed.ts` translating mock data into
  rows. UI still read from `mock-data.ts` at this point.
- **2026-07-07 — Seed data.** Added `User.password` (migration) + `bcryptjs`; rewrote
  `prisma/seed.ts` with a demo user, system item types, collections, and items, with idempotent
  item↔collection linking. Fixed the collection upsert, which was a no-op on existing rows.
- **2026-07-07 — Dashboard wired to real data.** `src/lib/db/collections.ts`, `items.ts`
  (`getPinnedItems`/`getRecentItems`), `stats.ts` (`getDashboardStats`), plus `getItemTypes()`
  and `getFavoriteCollections()`. Sections became async server components; `SidebarNav` became
  prop-driven. `CollectionCard` border color follows the dominant item type.
- **2026-07-10 — Pro badge in sidebar.** `isPro` flag on `ItemTypeSummary` (derived from the
  type name being File/Image); sidebar shows a "PRO" badge for those. `/` now redirects to
  `/dashboard`.
- **2026-07-11 — Dashboard fixes (code-scanner follow-up).** De-duplicated a
  `getRecentCollections(6)` query, added a `take` limit to `getPinnedItems`, removed a `truncate`
  class that was overriding `line-clamp-2` on `ItemCard`.
- **2026-07-28 — Auth, phases 1–3.** `next-auth@beta` + `@auth/prisma-adapter` with the split
  config pattern (`auth.config.ts` edge-safe, `auth.ts` full, JWT strategy); `proxy.ts` protects
  `/dashboard`. Credentials provider with real bcrypt validation; `POST /api/auth/register`
  (Zod-validated, duplicate-email check). Custom `/sign-in` and `/register` pages;
  `SignInForm`/`RegisterForm`/`UserAvatar`; `UserFooter` with a sign-out dropdown; minimal
  `/profile`. `.mcp.json` added to `.gitignore` (it had held a live API key).
- **2026-07-28 — Email verification on register.** Resend-based email (`src/lib/email.ts`), 24h
  token via the `VerificationToken` model, `verify-email`/`resend-verification` routes;
  Credentials `authorize` blocks unverified sign-in via a custom `EmailNotVerifiedError`; new
  `/check-email` page; shared 30s `useResendCooldown` hook.
- **2026-07-29 — Email verification toggle.** `isEmailVerificationEnabled()`
  (`EMAIL_VERIFICATION_ENABLED`, default on); all four touchpoints skip verification when off.
  Set off locally since Resend has no verified domain yet.
- **2026-07-29 — Forgot password.** `src/lib/password-reset-token.ts` reuses `VerificationToken`
  with a `reset:` prefix (1h expiry, isolated from verification tokens); `forgot-password` /
  `reset-password` routes always return success regardless of email existence (no
  account-existence leak); new `/forgot-password` and `/reset-password` pages.
- **2026-07-30 — Profile page.** Expanded the minimal `/profile`: `getCurrentUser()` gained
  `id`/`createdAt`/`hasPassword` (hides password UI for OAuth-only users); `getProfileStats()`;
  `change-password` / `delete-account` API routes; `ChangePasswordForm` / `DeleteAccountDialog`
  (type "delete" to confirm). `/profile` now renders in the app shell.
- **2026-07-31 — Auth rate limiting.** `@upstash/ratelimit` + `@upstash/redis`;
  `src/lib/rate-limit.ts` (sliding-window, fails open if Upstash is unconfigured). Protects
  register / forgot-password / reset-password / resend-verification by IP, and login (5 per 15
  min) inside `authorize()` via a `RateLimitedError`. Needs Upstash env vars set in the deploy
  environment to actually enforce.

## August 2026 — items, editors, files, search

- **2026-08-01 — Items list view.** `getItemTypeBySlug` / `getItemsByType`; `/items/[type]`
  page with a responsive `ItemCard` grid (three columns on large screens); unknown slugs 404;
  `proxy.ts` protects `/items`.
- **2026-08-01 — Vitest setup.** `vitest.config.ts` (node env, scoped to `src/actions/**` and
  `src/lib/**` only — no DOM/component testing by design); `npm run test` / `test:watch`;
  example tests for existing utilities.
- **2026-08-01 — Item drawer.** `getItemById` / `GET /api/items/[id]`; `ItemDrawerProvider`
  context + `ItemDrawer` (Sheet) with a header/action bar (Favorite/Pin/Copy wired,
  Edit/Delete rendered only); `ItemCard` became a keyboard-accessible client component that
  opens the drawer. Fixed a `tailwind-merge` modifier conflict and an infinite-skeleton bug on
  failed fetch.
- **2026-08-03 — Drawer edit mode.** First server action: `updateItem` (`src/actions/items.ts`,
  Zod-validated, ownership-checked). Drawer gained inline edit with type-specific fields;
  `GET /api/items/[id]` returns a `canEdit` flag. Added `items.test.ts`.
- **2026-08-03 — Item create & delete.** `createItem` / `deleteItem` actions; the previously
  dead "New Item" button opens `NewItemDialog` (File/Image excluded here); Delete wired to an
  `AlertDialog`. Verification pass caught that link items didn't actually require a URL — fixed
  with a client-side Create-button disable. Polished the type `Select` (was showing a raw
  value), added icons and placeholders.
- **2026-08-04 — Code editor.** `@monaco-editor/react` `CodeEditor` (`vs-dark`, macOS window
  controls, copy button, auto-grow 120–400px); wired into snippet/command content only.
- **2026-08-04 — Type-specific Add button.** Each `/items/[type]` page shows "Add {Type}";
  `NewItemDialog` gained `defaultItemTypeId` to preselect and lock the type.
- **2026-08-04 — Markdown editor.** `MarkdownEditor` (Write/Preview via `react-markdown` +
  `remark-gfm`); wired into prompt/note content.
- **2026-08-06 — File upload (Cloudflare R2).** `src/lib/r2.ts` (S3-compatible client),
  `file-constraints.ts`; `POST /api/upload`, `GET /api/download/[id]`; `FileUpload` component
  (drag-and-drop, progress bar); `createItem`/`deleteItem` persist file fields and clean up R2
  on delete. Fixed a pre-existing dialog "grid blowout" from long filenames via
  `[&>*]:min-w-0`. Tests for the pure logic only.
- **2026-08-10 — Image gallery view.** `ImageThumbnailCard` replaces `ItemCard` on
  `/items/images` (three-column grid). Styling iterated to a solid-background footer bar
  (always-legible title), type-color dot, hover-dim + Expand icon; fixed `h-44` height to match
  other cards — a deliberate deviation from the spec's `aspect-video`, for grid rhythm.
- **2026-08-10 — File list view.** `src/lib/file-icon.ts` (extension → icon, unit-tested);
  `FileListRow` (icon, title/filename, size, date, pin/favorite, Download) replaces the card
  grid on `/items/files` only.
- **2026-08-10 — Quick-copy on item cards.** `ItemCard` gained a ghost Copy button
  (content/url/description → clipboard, toast). Image and file rows unchanged (already have
  Download).
- **2026-08-10 — Security audit (code-scanner).** Found: most item/collection read queries not
  scoped by `userId` (cross-tenant leak, Critical); `/api/items/[id]` and `/api/download/[id]`
  don't check ownership (High); plus medium/low code-quality items.
- **2026-08-11 — Per-user data isolation (Critical/High fixes).** Scoped
  `getPinnedItems`/`getRecentItems`/`getItemsByType`/`getItemById`/`getItemTypes`/
  `getRecentCollections`/`getFavoriteCollections`/`getDashboardStats` by `userId`; threaded
  `userId` through the dashboard/items/profile pages; both API routes now pass
  `session.user.id`. Verified a second user sees an empty dashboard and 404s on demo-owned
  resources.
- **2026-08-11 — Second audit + fixes.** Isolation fix confirmed. Dropped SVG from allowed
  upload types (stored-XSS vector); memoized the drawer context; split `ItemDrawer.tsx`
  (484 → ~230 lines) into `ItemDrawerView` / `ItemDrawerEditForm` / `DeleteItemDialog`; added a
  shared `useClickableCard` hook; `getRequestIp` falls back to `x-real-ip`; rate-limited
  change-password / delete-account. MIME sniffing left out of scope.
- **2026-08-15 — Collection create.** `createCollection` action + `NewCollectionDialog` wired
  into the previously dead "New Collection" buttons. Used a server action (not an API route) to
  match the established mutation pattern.
- **2026-08-15 — Add item to collections.** `getCollectionOptions`; `CollectionMultiSelect`
  combobox; `createItemSchema`/`updateItemSchema` gained `collectionIds`, re-filtered
  server-side through `getOwnedCollectionIds` (silently drops IDs the user doesn't own rather
  than trusting the client).
- **2026-08-15 — Collections pages.** `/collections` list and `/collections/[id]` detail,
  splitting a collection's contents into Items / Images / Files sections. Found and fixed a
  case-sensitivity bug in type-name comparison (`ItemType.name` is capitalized, not lowercase)
  via a tested `groupItemsByType` pure function.
- **2026-08-17 — Global search / command palette.** `getAllItemsForSearch` /
  `getCollectionsForSearch` feed a `GlobalSearch` component (shadcn `Command`/`cmdk`,
  Cmd/Ctrl+K). Fixed a missing `<Command>` provider wrapper and a keystroke freeze from `cmdk`
  re-scoring full raw content — fixed with a tested `toSearchPreview` helper that truncates
  server-side.
- **2026-08-17 — Pagination.** `src/lib/pagination.ts` (windowed page range with ellipsis
  collapsing, tested); `getItemsByType`/`getItemsByCollection`/`getAllCollections` take
  `skip`/`take`; `PaginationControls` wired into the three list pages. Fixed a hydration
  mismatch in `PaginationLink` (a base-ui `data-slot` conflict).
- **2026-08-17 — Settings page.** New protected `/settings` in the shell; moved the
  Security/Danger-Zone cards off `/profile` (components relocated to
  `src/components/settings/`, no logic change).
- **2026-08-17 — Editor preferences.** `editorPreferences Json?` on `User` (migration);
  `src/lib/editor-preferences.ts` (defaults + validating parser); server action +
  `GET /api/editor-preferences`; globally-mounted `EditorPreferencesProvider` applies changes
  optimistically. `CodeEditor` reads font/tab size, theme, wrap, minimap; registers `monokai`
  and `github-dark` as custom Monaco themes. New auto-saving card on `/settings`.
- **2026-08-17 — Favorites page.** `getFavoriteItems` / `getFavoriteCollectionsList`;
  `/favorites` with a compact monospace list (`FavoritesList`), plus a top-bar star link.
- **2026-08-17 — Favorite toggle everywhere.** `setItemFavorite`/`setCollectionFavorite` +
  `toggle*` actions; wired the display-only Star buttons in the drawer, collection header, and
  cards, all with optimistic local state that reverts on failure. Swapped `Heart` → `Star` for
  consistency.
- **2026-08-17 — Favorites sorting.** "Sort by" Select (Newest/Oldest/Name/Type) on
  `/favorites`; comparators extracted to `src/lib/favorites-sort.ts` (tested) — caught a real
  bug in a shared `byDate` helper where an unused parameter had silently broken
  newest/oldest for collections.
- **2026-08-17 — Pinned items.** `toggleItemPin` / `setItemPin` actions mirroring the favorite
  pair; drawer Pin button wired with optimistic state; pinned items sort to the top via
  `orderBy`. Items only.
- **2026-08-17 — Homepage.** Static prototype at `prototypes/homepage/` (no build step:
  animated "chaos to order" hero, features grid, AI Pro section, pricing toggle, CTA, footer),
  then the real one: `src/app/page.tsx` checks `auth()` and redirects signed-in users to
  `/dashboard`, otherwise renders the marketing page ported into `src/components/homepage/`
  with real `ItemType` colors. `PricingToggle` collapsed into one client component after the
  spec's server/client render-prop split broke the RSC boundary. Sign-out now goes to `/`.
- **2026-08-18 — Navigation latency.** A "feels slow" report: no `loading.tsx` / Suspense
  anywhere, and every authenticated page awaited `getCurrentUser()` alone before its data
  batch. Added `getSessionUserId()` (DB-free JWT decode) folded into each page's `Promise.all`;
  added `loading.tsx` to all seven authenticated routes; moved them into a shared
  `(app)/layout.tsx` group so only `<main>` shows the spinner. Warm-pass TTFB dropped from
  ~400–950 ms to ~50–95 ms.
- **2026-08-18 — UI review (`ui-reviewer`) of `/` and `/dashboard`.** Fixed a real bug in the
  agent's own config (a quoted wildcard tool pattern the loader didn't expand). Findings:
  mobile nav bleed-through at 375px; icon-only buttons under the touch-target minimum; no
  `prefers-reduced-motion` fallback; dashboard search wraps at tablet width; placeholder footer
  legal links.
- **2026-08-18 — Mobile nav overlay + touch targets.** Fixed the nav dropdown bleed-through via
  `min-h-[calc(100dvh-4.25rem)]` + a fully opaque header while open + a bigger hamburger hit
  area. Bumped icon-only buttons 24 → 28px (`icon-sm`) across the cards and rows. Reduced-motion
  and tablet-search deferred.
- **2026-08-18 — Homepage nav on auth pages.** `HomeNav` now renders atop `/sign-in` /
  `/register`; the homepage `Logo` became the app's brand mark too, replacing a separate
  icon+text combo in `TopBar`.
- **2026-08-18 — Stripe, phase 1 (infrastructure).** `/research` produced a phased plan.
  Migration adding `stripeSubscriptionStatus` / `stripeCurrentPeriodEnd`; `src/lib/stripe.ts`
  (lazy client); `src/lib/plan-limits.ts` (pure gating, ships unused); `session.user.isPro`
  re-synced from the DB on every token validation (accepted per-request DB cost). Worked around
  a module-augmentation gotcha — `declare module "next-auth/jwt"` silently failed to merge;
  targeting `@auth/core/jwt` directly fixed it. Added `.env.example`. No enforcement/webhook/UI
  yet.
- **2026-08-18 — Stripe, phase 2 (integration & UI).** `POST /api/webhooks/stripe`
  (signature-verified, syncs `isPro`/status); a canceled subscription stays Pro until the
  period ends (`.deleted`, not `.updated`, revokes). Checkout/portal routes; `BillingSection`
  on `/settings`. Enforcement behind `PLAN_GATING_ENABLED` (off by default): `createItem` /
  `createCollection` reject over-limit and Pro-only-type creates for non-Pro users. Known
  ordering gap: if `subscription.created` beats `checkout.session.completed`, `isPro` syncs
  only on the next `subscription.updated`.
- **2026-08-18 — Trimmed demo seed data** to fit the free tier (3 collections, 24 items),
  reassigning rather than deleting items; cleaned up stale `Collection` rows the upsert-only
  seed left behind.
- **2026-08-18 — Upgrade page + CTA.** Sidebar "PRO" badge now shows only for gated types when
  the user isn't already Pro; a non-Pro-only "Upgrade" top-bar button links to a new `/upgrade`
  page (`UpgradePlans`, Free vs Pro, monthly/yearly toggle) that redirects already-Pro users to
  `/settings`. Free/Pro copy extracted to `src/lib/pricing-features.ts`, shared with the
  homepage.
- **2026-08-19 — Language dropdown + type-Select fix.** Replaced the free-text Language field
  with a Select of 25 Monaco language ids, moved above Content; fixed the item-type Select's
  dropdown alignment (`alignItemWithTrigger={false}`).
- **2026-08-19 — AI research.** Via Context7: `gpt-5-nano` is Chat-Completions-supported but as
  a reasoning model can silently return empty content when its token budget is exhausted;
  OpenAI still recommends the Responses API. Fixed a contradiction this surfaced in
  `ai-integration-plan.md`.
- **2026-08-19 — AI auto-tagging (first AI feature).** `src/lib/openai.ts` (lazy client),
  `auto-tag.ts` (input truncation, parses both array shapes); `generateAutoTags` action (auth →
  Pro-gate → 20/hr rate limit → Responses API), taking raw title/content since the button is
  needed pre-creation. `SuggestTagsButton` in both dialogs, hidden for free users. Found via
  testing that the Responses API rejects JSON-object output unless the literal word "json"
  appears in the input itself — fixed by appending a line to the prompt.
- **2026-08-19 — AI description generator.** `description.ts` + `generateDescription`,
  mirroring auto-tag but requesting plain text (sidesteps the "json" gotcha).
  `SuggestDescriptionButton` in both dialogs; both AI buttons switched to `variant="outline"`.
- **2026-08-19 — AI explain code.** `explain.ts` + `explainCode`, same shape, returns markdown
  (not persisted). `CodeEditor` gained an Explain action and a Code/Explanation switcher; the
  editor stays mounted (hidden) to avoid a Monaco remount. Drawer read view, snippet/command
  only.
- **2026-08-19 — AI prompt optimizer.** `optimize-prompt.ts` + `optimizePrompt`. `MarkdownEditor`
  gained an Optimize action for prompt items (drawer read view) with an Original/Optimized
  toggle and "Use this version" / "Keep original"; accepting persists via `updateItem`. Guarded
  against a double-submit with an `isAccepting` state.

## August 2026 — refactor passes (`refactor-scanner`)

A batch of scoped duplication scans on 2026-08-24, each followed by an extraction. No behavior
change in any of them.

- **`src/actions`** → `checkOwnership()` (`src/lib/ownership.ts`, replaced 6 blocks);
  `ActionResult<T>` (`src/types/action-result.ts`, replaced 4 local declarations);
  `isAiProGated()` + shared rate-limit constants (collapsed `ai.ts`'s 4 Pro-gate blocks);
  `requireSessionUser()` (`src/lib/auth-guard.ts`, replaced all 13 `auth()` blocks).
- **`src/components`** → `useOptimisticToggle` hook (5 of 6 flagged toggles);
  `FeatureList` / `PricingIntervalToggle` + `startProCheckout()` (`src/lib/stripe-client.ts`);
  `parseTagsInput` / `appendTagToInput` (`src/lib/tags.ts`, replaced 6 inline copies including
  a byte-for-byte duplicate function); `BackToSignInLink`; `DashboardGridSection`.
- **`src/lib/db`** → `toItemDetail` / `itemDetailInclude` (replaced 3 mapping blocks);
  `getPaginatedItemsByWhere` (shared pagination boilerplate).
- **`src/hooks`** → generalized `useOptimisticToggle` with an exported `toggleOptimisticField()`
  for callers whose boolean lives inside larger state; adopted in `ItemDrawer.tsx`.
- **`src/app/api`** → `requireApiSessionUser()` (replaced 7 auth+401 blocks);
  `zodErrorResponse()` (`src/lib/api-response.ts`, 6 blocks);
  `deleteVerificationToken()` (`src/lib/verification-token-store.ts`, 4 Prisma deletes);
  `enforceRateLimit()` (`src/lib/rate-limit.ts`, 6 check-and-429 blocks); folded the Stripe
  `APP_URL` fallback into `stripe.ts`.
- **`src/app` (pages)** → `ItemCardGrid` / `ImageThumbnailGrid` / `FileListGroup` grid
  renderers; `AuthCard` (replaced the identical Card skeleton across all 5 auth pages);
  `singularize` → `src/lib/text.ts`.
- **`src/components/dashboard`** → `ItemFormFields` (the shared Title→…→Tags sequence, per-field
  callbacks since the two forms' state shapes differ; `NewItemDialog` 324 → 239 lines,
  `ItemDrawerEditForm` 191 → 88); `useItemFavoriteToggle` + `FavoriteToggleButton`;
  `CollectionFormFields`; `useCollectionDialogs` + `CollectionDialogs`.

## August 2026 — sidebar polish, drawer scroll

- **2026-08-24 — Sidebar active-item highlighting.** `SidebarNav.tsx` became a client component
  (`usePathname()`) highlighting the active item-type / collection / "View all" link. A
  collection that's both favorited and recent highlights in both sections (kept, not deduped).
- **2026-08-24 — Drawer outer-scrollbar fix.** `MarkdownEditor.tsx`'s `TabsContent` panels were
  contributing their full unclipped height to the Sheet's `scrollHeight` despite being visually
  clipped (a nested-flex/overflow quirk). Fixed with `[contain:layout]` on the Write/Preview
  panels.

## August 2026 — "Ledger" design-system redesign

Adopted a single flat, monospace, zero-radius "ledger" aesthetic, screen by screen. Tokens and
the full pattern reference live in `context/design-system.md`.

- **2026-08-25 — Dashboard (desktop).** Dark-mode hex palette mapped onto shadcn vars in
  `globals.css`, new `--ink-body` / `--rule-strong` tokens, `--radius: 0`; JetBrains Mono
  everywhere (`layout.tsx`). Built the "collapsed hairline border" grid pattern
  (`StatsCards`, `DashboardGridSection`, `ItemCardGrid`). `CollectionCard` / `ItemCard` (shared
  with `/items/[type]`, `/favorites`, `/collections`) became plain grid-cell divs with
  `border-l-2` accent stripes (vivid per-type colors kept), soft-tint chips via new
  `withAlpha()` (`src/lib/color.ts`), relative-time badges via `formatRelativeTime()`.
  `ItemDrawerEditForm` left unstyled (no mockup); the mockup's "Last opened / ID" drawer footer
  omitted (needs new schema). Flagged: a pre-existing `/favorites` hydration mismatch from
  `toLocaleDateString()`.
- **2026-08-25 — Auth pages.** `AuthCard.tsx` (shared by all 5 auth pages) dropped shadcn
  `Card` for a plain accent-striped div, gained optional breadcrumb props. `SignInForm` /
  `RegisterForm` restyled — no field/validation changes. `forgot-password` / `reset-password` /
  `check-email` inherit the `AuthCard` restyle only.
- **2026-08-25 — Create dialogs.** No mockup; extrapolated. Restyled at the call sites
  (`NewCollectionDialog` / `NewItemDialog`), not shared `ui/dialog.tsx`. Field styling via
  `LABEL_CLASS` / `FIELD_CLASS` constants in the shared form-field components (accepted ripple
  into `EditCollectionDialog` / `ItemDrawerEditForm`).
- **2026-08-25 — `context/design-system.md`.** Wrote the reference doc that replaces mockups
  going forward — tokens, layout patterns, form conventions, six engineering principles, and a
  done/partial/not-started status table.
- **2026-08-25 — Reduce Pro gating for the portfolio.** `FREE_ITEM_LIMIT` 50 → 5,
  `FREE_COLLECTION_LIMIT` 3 → 1 so the gate is reachable quickly. Added
  `activateDemoPro` / `deactivateDemoPro` actions (`src/actions/billing.ts`) — a portfolio-only
  bypass flipping `User.isPro` directly, alongside the real Stripe flow; refuses to deactivate
  users with a real `stripeCustomerId`. `PLAN_GATING_ENABLED` still needs enabling in the
  deploy env.
- **2026-08-25 — DevStash → Kept rebrand.** Replaced all user-facing "DevStash" strings with
  "Kept" (`layout.tsx`, auth/settings copy, homepage, `email.ts`), `package.json` name; seed
  and scripts use `demo@kept.app`; a scoped Neon `UPDATE` on the dev branch so the live demo
  login matched immediately. Left untouched at the time: history entries, dated specs, research
  docs, and the Neon project id (an external identifier).
- **2026-08-25 — Merged the redesign branch chain into `master`** (dashboard → auth → create
  dialogs → design-system-reference).
- **2026-08-25 — Homepage redesign — positioning + ledger.** Dropped the "developer knowledge
  hub" framing; new tagline "Keep Everything. Find Anything." Moved `/` onto the ledger system
  across `Logo` / `HomeNav` / `HeroSection` / `ChaosToOrder` / `FeaturesSection` / `AiSection` /
  `PricingToggle` / `FinalCtaSection` / `Footer`; kept the "chaos" side's messiness as the
  deliberate "before" half. Flagged: every `Button` computes to a 10px radius instead of 0
  (a `--radius` resolution issue between `globals.css` and shadcn). Fixed a real bug in
  `ChaosToOrder`'s mouse-repel math (an unfloored distance divide could spike toward infinity
  near the cursor) and reworked the ambient movement to a wander-steering model.
- **2026-08-25 — Moved mockup HTML** from `context/redesign/` to `prototypes/redesign/`.
- **2026-08-25 — `Logo.tsx`.** Implemented the user-selected "bookmark-with-checkmark"
  direction as a hairline SVG (`text-primary`), shared by `HomeNav` / `Footer` / `TopBar`;
  later gained a `size` prop and got bumped to `lg` in `TopBar` and `HomeNav`.
- **2026-08-26 — Sidebar chrome.** Closed a scope cut from the dashboard pass. Scoped to
  sidebar chrome only (top-bar buttons/search and a theme toggle deferred as real
  functionality). `SidebarNav.tsx`: uppercase tracked section labels with dotted dividers,
  `withAlpha()`-tinted icon chips, uppercase type names (collections stay Title Case),
  zero-padded tabular counts, zero-count types dimmed rather than hidden, square accent markers
  for favorite/recent collections.
- **2026-08-26 — `topbar-footer-theme-spec.md`** written, flagging the light/dark toggle as
  real new functionality with open questions rather than assuming an approach.
- **2026-08-26 — User menu + light/dark toggle.** `next-themes` was installed but never
  mounted; added a `ThemeProvider` (`attribute="class"`, `defaultTheme="dark"`,
  `enableSystem={false}`), replacing the hardcoded `.dark` class. Restyled the `UserFooter`
  dropdown with an Appearance section; `UserAvatar` gained a `shape` prop; `useHasMounted`
  guards the toggle against a hydration mismatch. First reachable `ui-reviewer` pass in light
  mode drove three rounds of fixes: `withAlpha()` chips were hardcoding the dark alpha suffix →
  `useSoftTintAlpha()` across all call sites + retuned light `--border`; empty trailing
  grid cells showed as a gray hole in light mode → tested `computeFillerClasses()` /
  `GridFillerCells.tsx`, then extended to the pinned/recent sections with `h-full` threaded
  through.
- **2026-08-26 — Toast redesign.** Restyled the sonner `Toaster` directly (it's the one
  component being skinned, not a shared wrapper) to a flat bordered panel with an accent
  left-stripe, two variants (success/error), dedicated tokens, `unstyled: true`. Responsive to
  bottom-center/full-width on mobile. Added `src/lib/toast.ts` so titles are generic status
  words with the message as the description; switched all 23 `sonner` import sites to it. No
  per-type duration (sonner limitation).
- **2026-08-26 — Auth pages polish.** `AuthCard` breadcrumb simplified to a single label;
  `/sign-in` / `/register` now center vertically; `HomeNav` Features/Pricing links point at
  `/#features` / `/#pricing` so they resolve off the homepage.
- **2026-08-26 — Colored icons on the homepage supported-types strip.** Now render in each
  type's accent color inside a `withAlpha()` chip, matching `ItemCard` / `SidebarNav`;
  reverses an earlier deliberate desaturation.
- **2026-08-26 — Sidebar font sizes.** A live check against the mockup found sidebar text at
  inherited defaults (14/12px) instead of the mockup's 11/10px. Resized `SidebarNav` and
  `UserFooter`; `UserAvatar` gained `fallbackClassName` so the square-variant initials size
  independently.
- **2026-08-26 — Collection favorite star.** Swapped `CollectionCard`'s static green square for
  a clickable `Star` (green fill); `FavoriteToggleButton` gained a `color` prop instead of a
  duplicate button; dropped the now-redundant dropdown item. Added success toasts everywhere
  favoriting happens app-wide — `useOptimisticToggle` gained an `onSuccess` callback.
- **2026-08-26 — Cursor-pointer audit.** Every `Button` rendered `cursor: default` (shadcn
  never set it); fixed at the primitive level in `ui/button.tsx` / `checkbox.tsx` /
  `switch.tsx` / `tabs.tsx` / `select.tsx`, plus 8 raw `<button>` elements that bypass the
  component. Left menu-item rows at `cursor-default` per the native-menu convention.
- **2026-08-26 — Item-card content preview.** A screenshot showed multi-line code crowded in
  the preview box. Bumped it from `h-[58px]` to `h-[92px]` and added `whitespace-pre-wrap
  break-words` so newlines/indentation survive while long tokens still wrap.

## August 2026 — pre-public review passes

- **2026-08-27 — UI review (dark `/dashboard` + create/favorite flows).** The `ui-reviewer`
  couldn't reach the drawer / `/collections/[id]` (every dynamic route 404'd — stale `.next`,
  environmental). Fixes: create dialogs gained `max-h-[90vh] overflow-y-auto` (were clipping
  below ~1366px); `aria-label` + `aria-hidden` on the card so `role="button"` stops dumping
  ~8KB into the accessible name; desktop shell breakpoint `md:` → `lg:` so tablet uses the
  mobile layout instead of a cramped 3-column top bar; favorite toggles now `router.refresh()`
  so the stats strip and sidebar favorites stop going stale; desktop toast offset 20 → 76 to
  clear the search field; new styled `src/app/not-found.tsx`. Smaller: empty-content preview
  box hidden with a bottom fade; `Heart` → `Star` in the stats strip.
- **2026-08-27 — UI review follow-up (drawer + `/collections/[id]`).** New `src/lib/format-date.ts`
  (`formatDate`, locale + `timeZone: 'UTC'` pinned) replacing bare `toLocaleDateString()` in
  `FileListRow`, the drawer header, and `FavoritesList` — those were throwing hydration
  mismatches. `aria-label` on the drawer's Edit/Delete, the Monaco copy button, and the
  `CollectionMultiSelect` search input. `EditCollectionDialog` chrome brought in line with
  `NewCollectionDialog`. Fixed-height box around the drawer image preview so a loading image
  no longer collapses then jumps. Deferred as separate design decisions: the read-view content
  preview cap, the weak destructive-button weight.
- **2026-08-27 — Route-aware mobile FAB.** The single `MobileTabBar` "+" now adapts:
  `/collections` → New Collection; `/collections/[id]` → New Item with that collection
  preselected; `/items/[type]` → New Item locked to that type. `NewItemDialog` gained
  `defaultCollectionIds` (preselected, not locked, filtered for safety); the FAB keys the
  dialog by `typeId:collectionId` so it remounts on navigation. Route parsing via regex on
  `usePathname()`.
- **2026-08-27 — Cleanup pass** over `src/`, folder by folder. Behavior-affecting:
  `useIsMobile` 767 → 1023px (chrome moved to `lg` that day, so 768–1023px was mis-classed);
  `BillingSection`'s bare `toLocaleDateString()` → `formatDate`. Extractions:
  `useCollectionFavoriteToggle`, `useProCheckout`, `AuthSwitchLink`, `applyItemUpdateResult`;
  reused `isProOnlyType` / `getUserStripeCustomerId` / `withAlpha` instead of local copies.
  Net −39 lines over 18 files.
- **2026-08-27 — Mobile shell viewport scroll fix.** On long lists the whole page scrolled
  instead of `<main>`, taking the top bar with it and sliding content under the fixed tab bar.
  Cause: the shell was `h-screen` (`100vh` = the large viewport on mobile, ignoring the
  collapsing address bar). Fixed `h-screen` → `h-dvh`.
- **2026-08-27 — Homepage theme toggle.** Added a light/dark control to `HomeNav` (also on
  `/sign-in` / `/register`) for signed-out visitors. New `ThemeToggle.tsx` — a
  Sun/`Switch`/Moon control; reuses the `next-themes` provider and `useHasMounted` guard.

## August 2026 — i18n

- **2026-08-27 — i18n (EN / FR / PL).** `next-intl@4` in cookie-based mode (no locale in the
  URL, so every route / redirect / `proxy.ts` matcher stayed untouched). `src/i18n/request.ts`
  resolves the locale via `resolveLocale` (cookie → `Accept-Language` → `en`); root
  `layout.tsx` became async with `<html lang>` + `NextIntlClientProvider` + localized
  `generateMetadata`. Persistence: `User.locale` column (migration), `setLocale` action
  (cookie + DB), `session.user.locale`, and `LocaleSync` reconciling the two once per `(app)`
  mount. `LanguageSwitcher` in `HomeNav` and `UserFooter`. `src/messages/{en,fr,pl}.json`
  (~40 namespaces; en is source, fr/pl machine drafts) with a `messages-parity.test.ts`.
  Non-obvious: `src/lib/toast.ts` is a plain module, so its status-word titles are localized by
  a render-phase provider setter; `format-date.ts` gained a `locale` arg (still deterministic);
  `relative-time.ts` gained `relativeTimeParts()`. Deliberately left English: system
  `ItemType.name`s (they drive routes/slugs), server-action `result.error` strings,
  `file-constraints` messages, `ui/*` internals, and emails.
- **2026-08-27 — Resizable item drawer.** Drag-to-resize on the drawer's left edge. Pure
  clamp/parse logic in `src/lib/resizable-drawer.ts` (tested); pointer-capture drag +
  `localStorage` persistence + rAF-throttled writes + viewport re-clamp + Arrow-key resize in
  `src/hooks/useResizableDrawerWidth.ts`; `ItemDrawer.tsx` renders a `role="separator"` handle
  with inline `style` to defeat the `sm:max-w` class, desktop-only. No new dependency (the
  app's `Sheet` is a Base UI `Dialog.Popup` with no built-in resize). Later: dropped the
  max-width cap so it can be dragged to the full viewport; made the handle an always-visible
  green accent line that brightens on hover/focus/drag.
- **2026-08-27 — Marketing nav declutter (`HomeNav.tsx`).** Crowded after i18n + theme toggle.
  Desktop: `LanguageSwitcher` + `ThemeToggle` moved past the CTAs to the far right, behind a
  thin divider. Mobile: they tuck into a kebab `DropdownMenu`; the auth CTAs shrink (with a
  `max-w-28 truncate` guard) so EN and PL both fit at 375px with the wordmark shown.

## August 2026 — portfolio preparation

- **2026-08-27 — Portfolio prep 1: repo hygiene & secret scan.** Pre-public safety gate, no app
  behavior change. `gitleaks detect --source . --log-opts="--all"` scanned 219 commits with
  zero findings. `.gitignore`: added `/playwright-report/`, `/test-results/`, `.idea/`.
  Untracked `.idea/` (6 files including `claudeCodeTabState.xml`) via `git rm --cached`.
  Removed pre-redesign `context/screenshots/*` and their references in
  `project-overview.md` §10. Confirmed `.env*` / `.mcp.json` were never tracked. Advisory
  finding for later: real name/email placeholders in `prototypes/redesign/*.html`.
- **2026-08-27 — Portfolio prep 2: docs trim & reorganize.** Restructured dev-process docs for
  a public reader. New `docs/architecture.md` (data model, routing, auth, AI pipeline, uploads,
  plan gating, i18n, with ER and request-flow diagrams). This log moved out of
  `context/current-feature.md` and compressed. `docs/specs/` (curated specs + index),
  `docs/research/` (the four research/plan docs + the auto-tag verification note),
  `docs/audits/` (the auth security review, findings annotated with current status),
  `docs/images/` (populated in prep 3). Four sub-500-byte spec stubs dropped.
  `context/current-feature.md` reset to the bare Status/Goals/Notes template.
- **2026-08-27 — Portfolio prep 3: README rewrite.** Replaced the create-next-app boilerplate
  with a portfolio-grade README — hero + badge row (CI badge forward-references prep 4),
  live-demo section (URL `kept-app-ten.vercel.app`; credentials left as placeholders per the
  user), screenshot table pointing at `docs/images/` (capture pass deferred — user adds the
  images), grouped feature list, tech-stack table, architecture blurb linking
  `docs/architecture.md`, getting-started with an env-var table, testing (`test:e2e`
  forward-references prep 5), `src/` tree, and a "how this was built" section linking
  `docs/specs/` / `docs/development-log.md` / `.claude/`. Added an `MIT` `LICENSE` (holder
  `john-pr`) and `docs/images/README.md` as a capture checklist. Noted but not fixed
  (prep 6's scope): `layout.tsx` `generateMetadata` has `title`/`description` but no
  `openGraph`.
- **2026-08-27 — Portfolio prep 4: GitHub project furniture.** `.github/workflows/ci.yml`
  (push + PR to `master`; Node 20 + npm cache; `db:generate` → lint → `tsc --noEmit` → unit
  tests) — the target of the README CI badge. Making it green surfaced two pre-existing latent
  failures: `npx tsc --noEmit` over the whole project (which `next build` doesn't do) flagged
  19 `vi.mocked(auth).mockResolvedValue(null)` calls where NextAuth v5's overloaded `auth`
  type makes `vi.mocked` infer a `NextMiddleware` parameter — fixed with `null as never` at
  each site; and `npm run lint` (bare `eslint`) was linting `prototypes/redesign/support.js`
  (the vendored Claude Design canvas runtime) — added `prototypes/**` and `src/generated/**`
  to the eslint `globalIgnores`. Also: `LICENSE` holder set to `Jan Przybysz` / 2026 (per
  explicit request, overriding the prep-1 name-scrub note), `"license": "MIT"` in
  `package.json`; issue templates (bug/feature) + `config.yml` (blank issues off, demo/docs
  links), `PULL_REQUEST_TEMPLATE.md`, `dependabot.yml` (npm + github-actions, weekly, grouped
  minor/patch), `CONTRIBUTING.md` (mirrors `context/ai-interaction.md`). `gh repo edit` set
  the description, homepage, and topics. `e2e.yml` deferred to prep 5 (needs the Playwright
  suite + a CI database strategy first).
- **2026-08-27 — Portfolio prep 5: Playwright E2E smoke suite.** `@playwright/test` +
  `playwright.config.ts` (chromium, `webServer` runs `npm run dev`, baseURL from
  `E2E_BASE_URL`, serial single-worker). `tests/e2e/`: `home` (hero + nav render, theme
  toggle flips `<html>` class, Features/Pricing anchors resolve), `auth` (register throwaway
  user → sign in → `/dashboard`; protected route redirects when signed out), `items` (create
  a snippet via the New Item dialog → appears in the list → open drawer → favorite → reload →
  still favorited), `search` (⌘/Ctrl+K palette → query → result → select opens the drawer).
  `global-setup.ts` hard-fails if `EMAIL_VERIFICATION_ENABLED=true` and warns if Upstash is
  configured; `playwright.config.ts` blanks `UPSTASH_*` for its own server so the 3-per-hour
  IP-keyed register limiter fails open across runs. Added `test:e2e` / `test:e2e:ui` scripts;
  the README "Testing" section documents the seeded-DB prereqs and `db:cleanup` for the
  `e2e-smoke-…@example.test` throwaway users. `vitest.config.ts` untouched (E2E is outside
  its globs). Non-obvious: the marketing nav's Sign In / Get Started CTAs render with an
  implicit `button` role (not `link`) via the shadcn `Button` `render` prop; the item drawer
  and command palette are both `role="dialog"`, so specs scope by accessible name; sign-in
  failures are surfaced by racing `waitForURL` against the form's `[data-slot="alert"]` (a
  bare `role="alert"` also matches sonner toasts, including the register success toast that
  survives the redirect). All 7 specs green locally over repeated runs.
- **2026-08-27 — Portfolio prep 6: Lighthouse & a11y pass.** `src/app/opengraph-image.tsx`
  (`next/og` `ImageResponse`, 1200×630, ledger palette) — the OG image gap (favicon.ico /
  icon.svg / apple-icon.png already existed, so the spec's "no favicon at all" premise was
  stale). `generateMetadata` gained `metadataBase`, a title template, `openGraph`, and
  `twitter` (`summary_large_image`). New `tests/e2e/a11y.spec.ts` (`@axe-core/playwright`,
  WCAG 2.0/2.1 A+AA, fails on serious/critical) over `/`, `/dashboard`, `/items/snippets`.
  It surfaced 10+10 `color-contrast` serious violations, all in the sidebar chrome from the
  2026-08-26 zero-count dim: the row-level `opacity-60` pushed the muted count text to
  2.71:1. Fixed in `SidebarNav.tsx` (dim via a real muted color on the label +
  `opacity-60` on the decorative chip only; active row and its count stay
  `text-foreground`) and `UserFooter.tsx` (square-avatar initials → `text-ink-body`); both
  screen-owning components, no `ui/*` edits. `.lighthouserc.json` + non-blocking
  `.github/workflows/lighthouse.yml` (dispatch + weekly, `@lhci/cli` against the deployed
  `/`). `docs/quality.md` records the before/after and the Lighthouse plan (production
  numbers captured at deploy in prep 7). All three axe checks clean; homepage and auth pages
  had zero violations to begin with.
- **2026-08-31 — Portfolio prep: demo seed + README polish.** `scripts/seed-demo.ts` — a
  standalone, idempotent seed for the public demo account (`demo@kept.app`, Pro,
  `emailVerified` set): upserts the 7 system item types, 6 collections, and 35 text items
  (snippet/prompt/command/note/link) by stable `demo-*` ids, with pins, favorites,
  ~3 months of spread timestamps, and 4 items in two collections for the M2M relation.
  Item↔collection join rows are upserted explicitly since `item.upsert` only runs the nested
  create on first insert. `scripts/seed-demo-prod.ts` (`npm run db:seed:demo:prod`) loads
  `.env.production` and skips the prompt; **already run against the production Neon branch —
  no need to re-run it in prep 7**. File/Image items deliberately out of scope (need real R2
  uploads; added by hand). Also captured the four README screenshots (`docs/images/`), filled
  in the demo credentials, removed the stale CI-badge/placeholder notes and the reference to
  the never-captured `chaos-to-order.gif`, and did a phrasing pass over the README.
