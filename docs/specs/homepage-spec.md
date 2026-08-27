# Homepage

## Overview

Replace the redirect-only `/` route with a real marketing homepage, built from the static prototype in `prototypes/homepage/` (`index.html`/`styles.css`/`script.js`). Signed-in users still land on `/dashboard`; signed-out users see the marketing page.

## Routing

- `src/app/page.tsx` becomes a server component:
  - If a session exists (`auth()`), `redirect("/dashboard")` (existing behavior, unchanged).
  - Otherwise render the new homepage sections.
- No new route segment — this is the app's `/`.
- Signing out (`UserFooter.tsx`'s `signOut()`) redirects to `/` instead of `/sign-in`, so a logged-out user lands on the marketing homepage.

## Component Breakdown

All new components live under `src/components/homepage/`. Split so only the pieces that need interactivity are client components; everything else stays a server component (mostly static markup/content).

**Server components** (static content, no state/effects):
- `HomePage` (or inline in `page.tsx`) — composes the sections in order.
- `HeroSection` — headline, subheadline, CTA buttons, renders `ChaosToOrder` for the visual.
- `FeaturesSection` — 6 feature cards grid. Card data as a local const array (icon, title, description, accent color).
- `AiSection` — Pro badge, checklist, code editor mockup (static code block, no live `CodeEditor`).
- `PricingSection` — card content/copy; wraps the interactive toggle+price in `PricingToggle` (client).
- `FinalCtaSection`
- `Footer`

**Client components** (interactivity/browser APIs):
- `HomeNav` (`'use client'`) — fixed nav; needs scroll listener for opacity and mobile menu open/close state.
- `ChaosToOrder` (`'use client'`) — the floating-icon `requestAnimationFrame` animation + mouse-repel from the prototype's `script.js`, plus the arrow and simplified dashboard mockup markup. Keep the animation loop self-contained (mount/cleanup in `useEffect`, cancel on unmount).
- `PricingToggle` (`'use client'`) — monthly/yearly switch, computes displayed Pro price ($8/mo vs $72/yr) via local state, matching the prototype's toggle behavior.
- `ScrollFadeIn` (`'use client'`) — small wrapper using `IntersectionObserver` to add a fade-in class when a section scrolls into view; wrap each section's content with it instead of hand-rolling the observer per section.

## Styling

- Tailwind v4 + shadcn/ui, matching the rest of the app — no hand-written CSS file, no Google Fonts `<link>` (use the app's existing font setup).
- Reuse the app's existing dark theme tokens (`globals.css` `@theme`) instead of the prototype's own hardcoded hex/dark palette where they overlap (background, foreground, border, card).
- Item-type accent colors (feature cards, dashboard mockup, AI tags) use the real `ItemType` colors from `context/project-overview.md` §3.1, not the prototype's placeholder palette.
- Use shadcn `Button` for all CTAs/nav actions; `Switch` (already added for editor preferences) for the pricing toggle if it fits visually, otherwise a small custom toggle matching the prototype.
- Reuse existing icon set (`lucide-react` via `src/lib/icon-map.ts`) for feature cards instead of the prototype's inline SVGs where an equivalent exists.

## Links & Buttons — must go to real destinations

| Element | Target |
|---|---|
| Nav logo | `/` |
| Nav "Features" / "Pricing" | `#features` / `#pricing` (in-page anchor, same as prototype) |
| Nav/hero/CTA "Sign In" | `/sign-in` |
| Nav/hero/CTA "Get Started" / "Get Started Free" | `/register` |
| Pricing "Get Started" (Free card) | `/register` |
| Pricing "Go Pro" (Pro card) | `/register` (no billing flow yet — Stripe is out of scope per project spec's monetization section) |
| Footer "Features" / "Pricing" | `#features` / `#pricing` |
| Footer "About" / "Contact" / "Privacy" / "Terms" | Leave as non-functional placeholders (`href="#"`) — no such pages exist yet; do not invent routes |

## Out of Scope

- No Stripe/billing wiring on the Pro CTA.
- No real "About/Contact/Privacy/Terms" pages.
- No AI features actually running in the AI section mockup — it's static, like the prototype.
- `prototypes/homepage/` stays as-is (reference only); do not delete it.

## Testing

- No server actions or `src/lib` utilities are introduced by this feature (pure UI + one `redirect` branch already covered by existing patterns), so no new unit tests are expected. If a non-trivial pure helper emerges (e.g. price formatting for the yearly toggle), extract and test it per the project's existing pattern.
