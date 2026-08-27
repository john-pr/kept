# TopBar, UserFooter & Light/Dark Toggle — "Ledger" Design System

## Overview

Three items scoped out of the 2026-08-26 Sidebar Redesign pass, deliberately deferred at the
time via `AskUserQuestion`. Source of truth: `prototypes/redesign/kept-dashboard.html`'s
top bar and user-menu markup (`prototypes/redesign/support.js` is just the Claude Design
canvas runtime that made that file interactive in-editor — no styling to port from it).

1. **TopBar buttons + search bar** — restyle only, same risk profile as the sidebar pass.
2. **UserFooter avatar** — restyle only, small and self-contained.
3. **Light/Dark appearance toggle** — real new functionality, not just a restyle. No light
   mode implementation exists today; this is materially bigger and has open implementation
   questions (see its own section below). Treat as separable from #1/#2 — could ship on its
   own branch even if #1/#2 land together.

All three are independent of each other; no reason they have to land in one pass. Suggest
starting with #1 and #2 together (pure CSS/markup, fast, low risk), then deciding on #3
separately once its approach is picked.

## 1. TopBar buttons + search bar

File: `src/components/dashboard/TopBar.tsx`.

Mockup treatment (`kept-dashboard.html` top bar row):
- **Search input**: bordered box (`bg-inset` equivalent → `bg-muted`), 32px height,
  uppercase-tracked placeholder. Currently `GlobalSearch.tsx` renders its own trigger
  bar/`CommandDialog`, shared with the mobile search icon and reused nowhere else with a
  different look — restyle at the `GlobalSearch` call site or component itself (it's not a
  shared `ui/` primitive, it's an app component, so direct edits are fine per
  `design-system.md`'s scope-discipline principle). Match height/border/`bg-muted` to the
  `FIELD_CLASS` convention already used in `CollectionFormFields.tsx`/`ItemFormFields.tsx`.
- **"New Collection" button**: outline treatment — border `border-rule-strong` equivalent
  (`border-foreground/20` or reuse existing outline `Button` variant), uppercase, tracked
  (`tracking-[0.14em] uppercase`), no change to click behavior (`NewCollectionDialog` trigger).
- **"New Item" button**: solid accent — this is already the default `Button` variant's
  color, just needs `tracking-[0.14em] uppercase` added (`NewItemDialog` trigger).
- **"Favorites" icon button**: currently `variant="outline" size="icon"` with a bare `Star` —
  matches the mockup's bordered icon-square treatment already, likely needs no change; just
  confirm sizing/border consistency once the buttons beside it change.
- **"Upgrade" button** (`variant="ghost"`, free users only): mockup doesn't depict this
  exact button (Pro-gating didn't exist yet when this mockup was made) — extrapolate: keep
  ghost styling, but consider whether it should also gain uppercase/tracking for consistency
  with its siblings once they change. Flag as a judgment call, not a hard requirement.

**Out of scope for this item:** `MobileSidebar`'s hamburger trigger, `MobileTabBar`'s FAB —
neither depicted in `kept-dashboard.html` (desktop-only mockup); don't invent mobile
treatment beyond what's already responsive, per `design-system.md`'s standing mobile caveat.

## 2. UserFooter avatar

Files: `src/components/dashboard/UserFooter.tsx`, `src/components/auth/UserAvatar.tsx`.

Mockup shows a square, bordered box (`border: 1px solid var(--rule-strong)`) with the user's
initials, not a circular avatar. `UserAvatar.tsx` is shared by `UserFooter.tsx` and
`profile/page.tsx` (grep-confirmed, only two call sites) — `profile/page.tsx`'s usage should
almost certainly stay circular (larger, more prominent identity display; the mockup doesn't
depict `/profile` at all). Recommended approach: add an optional `shape?: "circle" | "square"`
prop to `UserAvatar.tsx` (default `"circle"`, unchanged for `profile/page.tsx`'s call site),
applying `rounded-none` instead of the `Avatar` primitive's default `rounded-full` when
`"square"` — `UserAvatar` is an app-level wrapper (not `ui/avatar.tsx` itself), so extending it
directly is consistent with prior redesign passes (e.g. `Logo.tsx`'s `size` prop). Only
`UserFooter.tsx` passes `shape="square"`.

No change to the dropdown menu items (Profile / Settings / Sign out) or their icons/order —
mockup's "Appearance" segmented control inside this same dropdown is covered under item #3
below, not bundled into this restyle.

## 3. Light/Dark appearance toggle

Files touched would span more than a restyle: `src/app/layout.tsx` (`<html className="dark
...">` is currently hardcoded, no toggle exists), `UserFooter.tsx`'s dropdown (new
segmented Light/Dark control, matching the mockup's `setLight`/`setDark` buttons), plus
wherever theme preference gets persisted and read back.

**This is genuinely new functionality**, not a visual-only pass like every other item in this
doc — `context/design-system.md`'s status table already flags "Dark mode is the only theme
actually rendered... Light values are stubbed in for a future toggle, don't rely on them
rendering anywhere today." The `:root` (light) CSS custom properties in `globals.css` are
already fully populated from the original mockup port, so the token layer is ready — what's
missing is the actual toggle mechanism and every component's contrast/appearance getting
*verified* in light mode (never visually checked, since it's never rendered).

**Open questions to resolve before implementing (don't guess — ask):**
- **Library vs. hand-rolled**: `next-themes` is the conventional Next.js answer (handles the
  no-FOUC `<html>` class injection via an inline blocking script, `prefers-color-scheme`
  detection, `localStorage` persistence) vs. a small custom implementation matching the
  mockup's own simpler `dark: null | boolean` + `componentDidMount` → `applyVars()` pattern
  (mockup defaults to *system* preference when unset, only overriding once a user clicks
  Light/Dark). A new dependency is a real call, not this doc's to make.
- **Persistence**: cookie (survives SSR, avoids a flash better) vs. `localStorage`
  (simpler, client-only, can't be read during server render → brief flash risk) vs. tied to
  `User` in the DB (cross-device, but adds a migration + server round-trip for a purely
  cosmetic preference — likely overkill).
- **Scope of verification**: every screen in `context/design-system.md`'s status table would
  need a pass in light mode once the toggle exists, since none of them have ever actually
  rendered with `:root`'s light tokens live — this could surface real light-mode-specific
  contrast/legibility bugs (soft-tint chips, `withAlpha()`'s dark-mode-only `2E` alpha
  suffix already has a light-mode `1F` counterpart in the mockup's own JS but `src/lib/
  color.ts`'s `withAlpha()` hardcodes the `2E` default and every caller omits the second
  arg — this alone is real follow-up work, not just "flip a class").

Given the size and the unresolved questions, **recommend scoping this as its own `/feature
load` once a direction is picked**, rather than folding it into #1/#2's restyle pass.

## Out of scope (all three items)

- No changes to `Sidebar.tsx`/`SidebarNav.tsx` — already done (2026-08-26 Sidebar Redesign).
- No changes to `ItemDrawer`/`ItemCard`/`CollectionCard` — already match the mockup.
- `MobileSidebar`'s own "Quick Actions"/sheet "Navigation" header labels — a known, accepted
  minor inconsistency left over from the sidebar pass, not part of this spec either.
- No schema or server-action changes for #1/#2. #3 may need a schema change *only* if the DB
  persistence option is chosen — to be decided, not assumed.

## Testing

#1/#2 are presentational-only (client components, Tailwind classes, one new prop on
`UserAvatar.tsx`) — no server actions or `src/lib` utilities touched, so no new unit tests
expected, matching every prior redesign pass. #3's testing needs depend entirely on which
persistence approach is chosen (a cookie-reading utility or DB-backed preference would need
`src/lib`/server-action test coverage; a pure client-side `localStorage` + `next-themes`
approach would not) — defer to that feature's own spec once scoped.
