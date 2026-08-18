# Stripe Integration — Phase 1: Core Infrastructure

## Overview

Lay the groundwork for Stripe billing: schema fields, the Stripe client, session/JWT plumbing for `isPro`, and the pure plan-limits module — with no checkout/webhook/UI wiring yet and no enforcement. This phase alone should not change any user-visible behavior other than `session.user.isPro` becoming available. Reference: `docs/stripe-integration-plan.md` §2.1–2.3, §3.1–3.3, §3.8, §3.10.

## Requirements

### Migration — subscription status fields

Add to `User` (`prisma/schema.prisma`), alongside the existing `isPro`/`stripeCustomerId`/`stripeSubscriptionId`:

- `stripeSubscriptionStatus String?` — `"active" | "trialing" | "past_due" | "canceled" | "incomplete" | ...`
- `stripeCurrentPeriodEnd DateTime?` — renewal/expiry date

Run `npx prisma migrate dev --name add_stripe_subscription_status` (never `db push`, per project rule).

### `src/lib/stripe.ts`

Lazy-throwing-getter client, mirroring `src/lib/r2.ts`'s pattern:

- `getStripeClient()` — throws a clear error if `STRIPE_SECRET_KEY` is unset, otherwise lazily constructs and caches a `Stripe` instance.
- Confirm the current `apiVersion` string via Context7 (`mcp__context7__query-docs`, library `stripe`) before hardcoding it — do not guess.
- Export `STRIPE_PRICE_ID_MONTHLY` / `STRIPE_PRICE_ID_YEARLY` read from env (default `""`).

### `src/lib/plan-limits.ts`

New pure-logic module, matching the project's pattern for extracted pure functions (`item-grouping.ts`, `search-preview.ts`, `favorites-sort.ts`):

- `FREE_ITEM_LIMIT = 50`, `FREE_COLLECTION_LIMIT = 3`, `FREE_GATED_TYPE_NAMES = new Set(["file", "image"])`.
- `isOverItemLimit(currentCount, isPro)`, `isOverCollectionLimit(currentCount, isPro)`, `isProOnlyType(typeName)` (case-insensitive).
- `isPlanGatingEnabled()` — reads `PLAN_GATING_ENABLED === "true"` from env, default off. This flag ships in Phase 1 but nothing checks it yet — enforcement is Phase 2's `docs/stripe-integration-plan.md` §3.4/§3.5/§3.7.

### Session/JWT — expose `isPro`

- `src/types/next-auth.d.ts` — add `isPro: boolean` to `Session.user` and `isPro?: boolean` to the `JWT` interface.
- `src/auth.ts` — `jwt` callback always re-fetches `isPro` from the DB (`prisma.user.findUnique({ select: { isPro: true } })`) keyed by `token.id`, not just on `trigger === "update"`, so a webhook-driven change (Phase 2) reaches the session on next request. `session` callback copies `token.isPro` onto `session.user.isPro`.
- **Confirm with the user before implementing**: this adds one DB query per JWT validation, which happens on most authenticated requests since `src/proxy.ts` protects `/dashboard`, `/items`, `/collections`, `/favorites`, `/profile`, `/settings`. Flag the trade-off (per `docs/stripe-integration-plan.md` §3.3) — alternatives are a TTL-based re-check or relying on `update()` + accepting staleness for webhook-only changes.

### `getCurrentUser()` extension

`src/lib/db/users.ts` — extend the returned shape and `CurrentUser` type with `stripeCustomerId`, `stripeSubscriptionStatus`, `stripeCurrentPeriodEnd`, needed by Phase 2's billing UI and portal-session route.

### Dependencies & env

- Add `stripe` (server SDK) to `package.json` dependencies. No `@stripe/stripe-js` — Checkout/Portal are server-initiated redirects, consistent with this codebase's server-action-first conventions.
- No `.env.example` exists in this repo today — confirm with the user before adding one (slightly outside this phase's literal scope, per `docs/stripe-integration-plan.md` §3.9). If approved, document (not commit real secrets): `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID_MONTHLY`, `STRIPE_PRICE_ID_YEARLY`, `NEXT_PUBLIC_APP_URL`, `PLAN_GATING_ENABLED`.

## Out of Scope (deferred to Phase 2)

- Webhook route, checkout/portal session routes.
- `BillingSection.tsx` and any settings-page UI.
- Actual enforcement in `createItem`/`createCollection`/`items/[type]/page.tsx` (the flag exists but nothing reads it yet).
- Stripe Dashboard/CLI setup (products, prices, webhook secrets) — not needed until Phase 2's webhook route exists to test against.

## Testing

- `src/lib/plan-limits.test.ts` — unit tests for `isOverItemLimit`, `isOverCollectionLimit`, `isProOnlyType`, `isPlanGatingEnabled` (pure logic, in scope per project's Vitest config).
- No tests for `src/lib/stripe.ts` (thin SDK wrapper, matches the existing untested-passthrough pattern for `r2.ts`).
- `npm run build` and `npm run test` must pass. No browser verification needed for this phase (no user-facing flow changes beyond `session.user.isPro` existing).
