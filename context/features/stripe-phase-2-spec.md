# Stripe Integration — Phase 2: Integration & UI

## Overview

Build on Phase 1's infrastructure (`src/lib/stripe.ts`, `src/lib/plan-limits.ts`, `session.user.isPro`, extended `getCurrentUser()`) to wire up real Stripe Checkout, the webhook handler, the Customer Portal, the settings-page billing UI, and (behind the existing `PLAN_GATING_ENABLED` flag) actual free-tier enforcement. Reference: `docs/stripe-integration-plan.md` §2.4–2.7, §3.4–3.7, §4, §5. Requires Phase 1 merged first.

## Requirements

### Webhook handler — `src/app/api/webhooks/stripe/route.ts`

First route in the codebase needing raw-body signature verification — deliberately does not follow the Zod-JSON-body pattern used elsewhere:

- No `auth()` session check (Stripe is the caller, authenticated via signature) and no rate limiting (must never fail-closed or throttle Stripe's retries).
- `request.text()` + `stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET)`; 400 on missing/invalid signature, no DB write.
- Confirm via Context7 (`next`) whether Next 16 App Router route handlers need an explicit raw-body opt-out, or whether `request.text()` already returns the unparsed body — verify before implementing.
- Handle: `checkout.session.completed` (links `stripeCustomerId`/`stripeSubscriptionId` via `client_reference_id`), `customer.subscription.created`/`.updated` (syncs `isPro`, `stripeSubscriptionStatus`, `stripeCurrentPeriodEnd`, keyed by `updateMany({ where: { stripeCustomerId } })` since these payloads carry no DevStash `userId`), `customer.subscription.deleted` (`isPro: false`, `stripeSubscriptionStatus: "canceled"`). Ignore unhandled event types.
- **Confirm cancellation timing with the user before implementing** (`docs/stripe-integration-plan.md` §7.2): does canceling in the portal revoke Pro access immediately, or run until `stripeCurrentPeriodEnd`? Determines whether `.updated` (status `canceled`, still within period) or `.deleted` is the trigger for flipping `isPro`.

### Checkout & portal session routes

- `POST /api/stripe/create-checkout-session` — session-authenticated, Zod-validates `{ interval: "monthly" | "yearly" }`, creates a `mode: "subscription"` Checkout Session with `client_reference_id: session.user.id`, `customer_email`, success/cancel URLs pointing at `/settings?checkout=success|canceled`. Standard `{success, data/error}` shape.
- `POST /api/stripe/create-portal-session` — session-authenticated, 400 if the user has no `stripeCustomerId`, creates a Billing Portal session returning to `/settings`.

### `BillingSection.tsx`

New client component on `/settings`, following `ChangePasswordSection.tsx`'s toggle/CTA shape, as a fourth Card:

- Free user: current item/collection counts vs. limits (reuse existing count queries), monthly/yearly toggle (reuse `PricingToggle.tsx` styling), "Upgrade to Pro" → `POST create-checkout-session` → redirect to `data.url`.
- Pro user: plan status from `stripeCurrentPeriodEnd`/`stripeSubscriptionStatus` ("Pro — renews ..." / "Pro — cancels ..."), "Manage subscription" → `POST create-portal-session` → redirect.
- `?checkout=success` / `?checkout=canceled` query params surfaced as a toast, matching `SignInForm`'s `verified=1`/`verifyError` pattern.

### Enforcement (behind `PLAN_GATING_ENABLED`, added in Phase 1 but unused until now)

All checks wrapped in `if (isPlanGatingEnabled() && ...)` — ships dark, matches `project-overview.md`'s "full access until launch" stance:

- `src/actions/items.ts` `createItem` — reject Pro-only types (`isProOnlyType`) for non-Pro users; reject once `getItemCountForUser(userId)` hits `isOverItemLimit`.
- `src/actions/collections.ts` `createCollection` — reject once `getCollectionCountForUser(userId)` hits `isOverCollectionLimit`.
- `src/lib/db/items.ts` / `collections.ts` — add thin `getItemCountForUser`/`getCollectionCountForUser` Prisma passthroughs (untested, matches existing pattern).
- `src/app/(app)/items/[type]/page.tsx` — render an upgrade prompt instead of the item list/"Add" button when the resolved type is Pro-only and the session user isn't Pro.

### Stripe Dashboard & CLI setup

Needed before any of this can be tested — see `docs/stripe-integration-plan.md` §4 for full steps:

1. Test-mode Stripe account; create Product "DevStash Pro" with $8/mo and $72/yr recurring Prices; copy IDs into env.
2. Copy test-mode Secret key into `STRIPE_SECRET_KEY`.
3. Local dev webhook: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`, copy the printed signing secret into `STRIPE_WEBHOOK_SECRET`.
4. Enable the Customer Portal (Dashboard → Settings → Billing).
5. Production webhook endpoint + live-mode keys deferred to actual launch.

## Out of Scope

- Flipping `PLAN_GATING_ENABLED=true` in any real environment — that's a separate, deliberate step at launch, not part of this feature's merge.
- Live-mode Stripe setup.

## Testing

Webhook and checkout/portal routes are not unit-testable under the current Vitest scope (`src/actions/`, `src/lib/` only) — verify manually via Stripe CLI:

- [ ] `npm run build` / `npm run test` pass after each step.
- [ ] `stripe trigger checkout.session.completed` / `customer.subscription.updated` / `.deleted` produce the expected DB state; replaying an event doesn't corrupt state (idempotency).
- [ ] Webhook route rejects missing/invalid `stripe-signature` (400, no DB write).
- [ ] Test checkout (`4242 4242 4242 4242`, monthly and yearly) redirects to `/settings?checkout=success`, webhook fires, `isPro` becomes `true`.
- [ ] "Manage subscription" opens the real Customer Portal for a Pro user; canceling flips `isPro` per the confirmed cancellation-timing behavior.
- [ ] With `PLAN_GATING_ENABLED=true`: free user blocked from a 51st item / 4th collection / File-Image creation with a clear error; Pro user is not.
- [ ] With `PLAN_GATING_ENABLED=false` (default): full regression check that current "everyone gets full access" behavior is unchanged.
- [ ] Lint passes.
- Browser verification (Playwright) is warranted here since Checkout involves an external redirect — confirm with the user before launching it, per the project's default of not using a browser unless asked.
