# Homepage Redesign — Positioning + Ledger System

## Overview

Two changes bundled into one pass, since they touch the same files:

1. **Positioning.** Drop the "developer knowledge" framing left over from the DevStash brand
   (`"Stop Losing Your Developer Knowledge"`, `"Your developer knowledge, organized"`, `"organized
   the way you actually think"` tied to "knowledge"). Replace with copy built around **Kept** as
   a name — the promise is that things you save actually stay found, not a generic "knowledge
   hub" pitch.
2. **Visual.** Move `/` onto the ledger design system (`context/design-system.md`). It's the
   last remaining screen still on the pre-redesign look — gradients, `rounded-2xl` cards,
   glass/blur nav, glow shadows — per that doc's status table.

Scope: `src/app/page.tsx` (unauthenticated branch) and everything under
`src/components/homepage/`. `prototypes/homepage/` stays untouched (reference only, per its
original decision). No routing, no new sections, no Stripe/checkout logic changes — copy and
styling only.

## Positioning

**Primary tagline:** *"Keep Everything. Find Anything."*

**Recommended subhead:** "Snippets, prompts, commands, notes, links, and files — kept in one
fast, searchable, AI-enhanced hub instead of scattered across a dozen different tools."

Alternates, in case the primary doesn't land in review:
- A. "A Place for Everything You'd Otherwise Lose"
- B. "Everything Worth Keeping, In One Place"
- C. "Nothing Gets Lost Here"

The eyebrow label "Built for developers" stays — the audience is still developers
(`context/project-overview.md` §2), only the specific "developer knowledge" phrase and the
generic "knowledge hub" framing are being retired.

## Copy changes

| File | Old | New |
|---|---|---|
| `HeroSection.tsx` | "Stop Losing Your Developer Knowledge" | "Keep Everything. Find Anything." |
| `HeroSection.tsx` | "Snippets, prompts, commands, notes, and links — scattered across a dozen tools. Kept brings it all into one fast, searchable, AI-enhanced hub." | "Snippets, prompts, commands, notes, links, and files — kept in one fast, searchable, AI-enhanced hub instead of scattered across a dozen different tools." |
| `FeaturesSection.tsx` | "Everything, kept in one place" | "Everything, Kept" |
| `FeaturesSection.tsx` | "Every type of developer knowledge, organized the way you actually think." | "Snippets, prompts, commands, notes, links, and files — organized the way you actually think, not the way a dozen different tools force you to." |
| `ChaosToOrder.tsx` | "Your knowledge today..." | "Scattered everywhere..." |
| `ChaosToOrder.tsx` | "...with Kept" | "...kept in one place." |
| `FinalCtaSection.tsx` | "Ready to Organize Your Knowledge?" | "Ready to Keep Everything in One Place?" |
| `FinalCtaSection.tsx` | "Join developers who stopped losing snippets, prompts, and notes to a dozen scattered tools." | "Stop losing snippets, prompts, commands, and notes to a dozen scattered tools." |
| `Footer.tsx` | "Your developer knowledge, organized." | "Everything you meant to keep, in one place." |

`AiSection.tsx`'s copy ("Let AI do the busywork" / "Kept Pro uses AI to keep everything
organized without the manual effort.") already doesn't use the retired framing — leave as-is.

## Visual — ledger system

Two categories below matter because of one CSS fact (`context/design-system.md`'s Design
tokens section): `--radius: 0` cascades through `@theme inline` into
`--radius-sm/md/lg/xl/2xl/3xl/4xl`, so any element using those **named** Tailwind radius
classes (`rounded-lg`, `rounded-2xl`, etc.) already renders flat with **zero edits**. Only
`rounded-full` and arbitrary-value radii (`rounded-[10px]`, `rounded-[2px]`) sit outside that
chain and need an explicit change.

**Already free (no edit needed):**
- Font (JetBrains Mono) and all color tokens — every homepage component already uses semantic
  Tailwind classes (`bg-card`, `border-border`, `text-muted-foreground`, `bg-primary`, etc.),
  which inherited the ledger palette automatically when `globals.css` was repointed in the
  dashboard-redesign pass (same reasoning `TopBar`/`Sidebar` got for free at the time).
- Every `rounded-2xl`/`rounded-lg` card shell (hero chaos/dashboard boxes, feature cards,
  pricing cards, AI code panel) — flattens via the token chain above.

**Needs explicit rework, file by file:**

- **`Logo.tsx`** — the four-square mark uses `rounded-[2px]` (arbitrary, not in the radius
  chain) → `rounded-none`. This component is already reused as the authenticated app's brand
  mark in `TopBar.tsx` (from the "Add Homepage Nav to Auth Pages" feature), so this also fixes
  a small pre-existing inconsistency there — the one deliberate ripple in this spec, and a
  welcome one, not an accident.
- **`HomeNav.tsx`** — replace the scroll-based glass look (`backdrop-blur-sm`,
  `bg-background/40` → `bg-background/95`) with a flat, always-solid `bg-background` +
  `border-b border-border`, matching `TopBar.tsx`'s own solid header instead of a glass effect
  used nowhere else in the app. Nav link labels (`text-sm font-medium`) become small
  uppercase-tracked labels (`text-[11px] tracking-[0.14em] uppercase`), matching the ledger's
  label convention. Sign In / Get Started buttons gain `tracking-[0.14em] uppercase` per the
  Buttons convention. **Ripples into `/sign-in` and `/register`**, which already render
  `HomeNav` — accepted, same as the Logo ripple, and consistent with design-system.md's
  standing rule to redesign shared components in place rather than fork variants.
- **`HeroSection.tsx`** — drop the `rounded-full` eyebrow pill for a plain tracked label (no
  border/fill, matching `AuthCard`'s breadcrumb treatment); drop the `bg-gradient-to-br
  bg-clip-text` headline treatment for flat `text-foreground` with a single `text-primary`
  word instead (the ledger system doesn't use gradient text anywhere else); CTA buttons gain
  `tracking-[0.14em] uppercase`.
- **`ChaosToOrder.tsx`** — the "chaos" (left) box may keep its shadows/rotation/messiness
  deliberately, since visual noise there reinforces the "before" half of the metaphor; but the
  "ordered" (right) dashboard mockup should match the real app's card language: its mini item
  cards currently use a top-border accent (`borderTop`) — switch to a left-edge accent
  (`borderLeft`, 2px), matching `ItemCard`/`CollectionCard`'s actual `border-l-2` convention.
  Tool icons' `rounded-[10px]` and mini dashboard cards' any arbitrary radii → `rounded-none`
  (named `rounded-lg` classes already flatten for free). Update captions per the Copy table.
- **`FeaturesSection.tsx`** — icon squares' `rounded-[10px]` → `rounded-none`. Consider
  switching from individually-bordered floating cards (`hover:-translate-y-1`) to the
  collapsed-hairline-grid pattern (`gap-px border border-border bg-border`, cells as
  `bg-card`) used everywhere else in the app (`StatsCards`, `ItemCardGrid`,
  `DashboardGridSection`) — recommended for consistency, but flag during review if the
  marketing page should keep a bit more visual "lift" than the app's inner screens.
- **`AiSection.tsx`** — the gradient amber `Badge` ("Pro Feature") → reuse the same flat
  outline "PRO" badge treatment already established in `SidebarNav.tsx`, rather than a
  one-off gradient pill. Code panel's `shadow-2xl` → drop for a plain bordered panel (keep the
  macOS traffic-light dots — those match the real in-app `CodeEditor` header). The
  "AI Generated Tags" chips (`rounded-full`) → bracket-style `[tag]` chips per
  design-system.md's tag-chip convention, matching real `ItemCard` tags.
- **`PricingSection.tsx` / `PricingToggle.tsx`** — the Pro card's glow `shadow-[...]` and
  gradient wash → flat card with a `border-l-2 border-l-primary` accent stripe (same
  fixed-token-accent treatment `AuthCard` uses). The gradient `rounded-full` "Most Popular"
  badge → a flat bracket-style uppercase label (`[MOST POPULAR]`). CTA buttons gain
  `tracking-[0.14em] uppercase`. **Do not** touch `src/components/pricing/FeatureList.tsx` or
  `PricingIntervalToggle.tsx` — those are shared with `/upgrade` and `/settings` (both still
  "not started" per design-system.md's status table) and are already semantic-classes-only, so
  they need no edits and restyling them would prematurely ripple into those unstarted screens.
- **`FinalCtaSection.tsx`** — drop the `radial-gradient` glow background for a flat bordered
  section, matching the rest of the ledger pages' lack of decorative background washes.
- **`Footer.tsx`** — mostly already flat; swap its column headings' `text-xs font-semibold
  tracking-wide uppercase` for the exact ledger label class (`text-[10px] tracking-[0.14em]
  uppercase text-muted-foreground`) for full consistency with the rest of the app.

`ScrollFadeIn.tsx` needs no change — it's a behavior-only wrapper, no visual output of its own.

## Out of scope

- No changes to Stripe/checkout logic, `/register`, `/sign-in` field behavior, or any
  server action.
- No new routes, sections, or nav links.
- No changes to `prototypes/homepage/` (stays as historical reference).
- `/upgrade` and `/settings` billing card stay on their current look — not part of this pass
  (see the `PricingToggle.tsx` note above for why their shared components are left alone).
- Footer's "About" / "Contact" / "Privacy" / "Terms" stay `href="#"` placeholders — still no
  such pages.

## Testing

Pure copy + Tailwind class changes across client/server presentational components — no server
actions or `src/lib` utilities are introduced or modified, so no new unit tests are expected,
matching the original `homepage-spec.md`'s testing note.
