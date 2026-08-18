# Stripe Integration Plan — DevStash Pro

**Status:** Planning document only. No code has been changed as part of producing this plan.
**Pricing:** $8/month or $72/year, per `context/project-overview.md` §6.
**Generated:** 2026-08-18, via `/research stripe-integration-research`.

---

## 1. Current State Analysis

### 1.1 User model schema

`prisma/schema.prisma` already has the scaffolding for Pro status, unused beyond display:

```prisma
model User {
  id                   String   @id @default(cuid())
  email                String   @unique
  emailVerified        DateTime?
  name                 String?
  password             String?
  image                String?
  isPro                Boolean  @default(false)
  stripeCustomerId     String?  @unique
  stripeSubscriptionId String?  @unique
  editorPreferences    Json?
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
  ...
}
```

`isPro`, `stripeCustomerId` (unique), `stripeSubscriptionId` (unique) already exist. **No new base columns are required** for a minimal integration, but see §2.1 for two fields worth adding (subscription status + current period end) to support the settings-page billing UI and expired/canceled-subscription handling without extra Stripe API calls.

Prisma: v7.8.0, new `prisma-client` generator (output `src/generated/prisma`), Neon serverless adapter. Migrations so far: `20260706123327_init`, `20260707080843_add_user_password`, `20260817083230_add_editor_preferences_to_user`. Standard: **always `prisma migrate dev`, never `db push`** (project rule).

### 1.2 NextAuth configuration

- Session strategy: **JWT** (`src/auth.ts`, `session: { strategy: "jwt" }`), `PrismaAdapter(prisma)`, GitHub + Credentials providers.
- Effective callbacks (in `src/auth.ts`, `authConfig` spread first, these win):
  ```ts
  callbacks: {
    async jwt({ token, user }) {
      if (user) { token.id = user.id; }
      return token;
    },
    async session({ session, token }) {
      if (session.user) { session.user.id = token.id as string; }
      return session;
    },
  },
  ```
- `src/types/next-auth.d.ts` only extends `Session.user` with `id` — no `isPro` today.
- The project's own research note (this task's source prompt) recommends **always syncing `isPro` from the DB in the `jwt` callback** rather than relying on `trigger === "update"`, since a Stripe webhook updates the DB out-of-band from any client `update()` call. This is the right call for this codebase and is adopted in §2.2 below.

### 1.3 How user data is accessed

- `getSessionUserId()` (`src/lib/db/session.ts`) — cheap JWT-only decode, no DB hit, used by page components to kick off parallel `userId`-scoped queries.
- `getCurrentUser()` (`src/lib/db/users.ts`) — full DB fetch (`findUniqueOrThrow`), returns `{ id, name, email, image, isPro, createdAt, hasPassword }`. Used by `/profile` and `/settings` (need more than just an id). **This is where Stripe-derived fields (plan status, renewal date, portal availability) should be added** for the new billing UI.
- Server actions (`src/actions/*.ts`) call `auth()` directly and guard-clause on `session?.user?.id`, never `getCurrentUser()`/`getSessionUserId()`.
- Response/return shape is uniform everywhere: `{ success: boolean; data?: T; error?: string }` (`ActionResult<T>` for actions, matching JSON for API routes).

### 1.4 Existing subscription/payment code

None. No `stripe` package, no webhook route, no checkout/billing UI beyond the static marketing pricing card (`src/components/homepage/PricingToggle.tsx`, explicitly out of scope per `context/features/homepage-spec.md`). All current "Pro" surfacing is cosmetic:

- `src/lib/db/items.ts` — `PRO_TYPE_NAMES = new Set(["file", "image"])`, derives `ItemTypeSummary.isPro` at query time (not stored).
- `src/components/dashboard/SidebarNav.tsx` — renders a "PRO" badge/dot next to File/Image nav links, but the links remain fully functional.
- `src/app/(app)/profile/page.tsx` — renders a `Badge` reading "Pro"/"Free" from `user.isPro`.
- Nothing currently blocks free users from creating files/images, exceeding item/collection counts, or using AI features. This matches `project-overview.md`'s explicit note: *"Development phase: infrastructure for Pro gating in place, but all users get full access until launch."*

This plan restores real enforcement behind a feature flag so it can be toggled on deliberately at launch (see §2.6).

---

## 2. Files to Create

### 2.1 Migration — subscription status fields

Add two fields to `User` beyond the existing three, so the settings page and webhook handler don't need extra Stripe API round-trips to render billing status or to safely no-op on stale/out-of-order webhook events:

```prisma
model User {
  ...
  isPro                     Boolean   @default(false)
  stripeCustomerId          String?   @unique
  stripeSubscriptionId      String?   @unique
  stripeSubscriptionStatus  String?   // "active" | "trialing" | "past_due" | "canceled" | "incomplete" | ...
  stripeCurrentPeriodEnd    DateTime? // renewal/expiry date, for "Renews on ..." / "Access until ..." UI
  ...
}
```

Run:
```bash
npx prisma migrate dev --name add_stripe_subscription_status
```

### 2.2 `src/lib/stripe.ts` — Stripe client

Mirrors `src/lib/r2.ts`'s lazy-throwing-getter pattern for a required external client:

```ts
import Stripe from "stripe";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

let client: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!STRIPE_SECRET_KEY) {
    throw new Error("Stripe is not configured. Missing STRIPE_SECRET_KEY.");
  }
  if (!client) {
    client = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2025-XX-XX.acacia" }); // pin to installed SDK's latest
  }
  return client;
}

export const STRIPE_PRICE_ID_MONTHLY = process.env.STRIPE_PRICE_ID_MONTHLY ?? "";
export const STRIPE_PRICE_ID_YEARLY = process.env.STRIPE_PRICE_ID_YEARLY ?? "";
```

> Use Context7 (`mcp__context7__query-docs`, library `stripe`) to confirm the current `apiVersion` string and Node SDK usage before implementing — do not guess the version string.

### 2.3 `src/lib/plan-limits.ts` — free-tier limits + gating helpers

New pure-logic module (testable, matches project's pattern of extracting pure functions like `item-grouping.ts`, `search-preview.ts`):

```ts
export const FREE_ITEM_LIMIT = 50;
export const FREE_COLLECTION_LIMIT = 3;
export const FREE_GATED_TYPE_NAMES = new Set(["file", "image"]);

export function isOverItemLimit(currentCount: number, isPro: boolean): boolean {
  return !isPro && currentCount >= FREE_ITEM_LIMIT;
}

export function isOverCollectionLimit(currentCount: number, isPro: boolean): boolean {
  return !isPro && currentCount >= FREE_COLLECTION_LIMIT;
}

export function isProOnlyType(typeName: string): boolean {
  return FREE_GATED_TYPE_NAMES.has(typeName.toLowerCase());
}
```

Also add to `src/lib/constants.ts` (existing file) rather than duplicating — actually keep these in `plan-limits.ts` since they're gating *logic*, not display constants like the existing `ITEMS_PER_PAGE`.

### 2.4 `src/app/api/webhooks/stripe/route.ts` — webhook handler

This is a **new kind of route** for the codebase — first one needing raw-body signature verification, so it deliberately does not follow the Zod-JSON-body pattern used elsewhere:

```ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { getStripeClient } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const stripe = getStripeClient();
  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ success: false, error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id;
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;
      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: { stripeCustomerId: customerId, stripeSubscriptionId: subscriptionId },
        });
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.created": {
      const subscription = event.data.object as Stripe.Subscription;
      await prisma.user.updateMany({
        where: { stripeCustomerId: subscription.customer as string },
        data: {
          isPro: ["active", "trialing"].includes(subscription.status),
          stripeSubscriptionId: subscription.id,
          stripeSubscriptionStatus: subscription.status,
          stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
        },
      });
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await prisma.user.updateMany({
        where: { stripeCustomerId: subscription.customer as string },
        data: { isPro: false, stripeSubscriptionStatus: "canceled" },
      });
      break;
    }
    default:
      break; // ignore unhandled event types
  }

  return NextResponse.json({ success: true });
}
```

Key deviations from the codebase's usual API-route pattern, called out explicitly:
- No `auth()` session check — Stripe is the caller, authenticated via signature, not a cookie.
- No rate limiting — this must never fail-closed or throttle Stripe's retries.
- Uses `request.text()` + `stripe.webhooks.constructEvent`, not `request.json()` + Zod.
- Prefer `updateMany` (keyed by `stripeCustomerId`) over `update` for subscription events, since the webhook payload has no DevStash `userId` — only `checkout.session.completed` carries `client_reference_id`, which is where the link is first established.
- **Next.js body parsing**: confirm via Context7 (`next`) whether Next 16's App Router route handlers need an explicit `export const runtime`/raw-body opt-out, or whether `request.text()` already gets the unparsed body by default in App Router (this differs from the old Pages API `bodyParser: false` config) — verify before implementing rather than assuming.

### 2.5 `src/app/api/stripe/create-checkout-session/route.ts`

Authenticated route the client hits when clicking "Upgrade to Pro":

```ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getStripeClient, STRIPE_PRICE_ID_MONTHLY, STRIPE_PRICE_ID_YEARLY } from "@/lib/stripe";
import { z } from "zod";

const schema = z.object({ interval: z.enum(["monthly", "yearly"]) });

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Invalid input" }, { status: 400 });
  }

  const stripe = getStripeClient();
  const priceId = parsed.data.interval === "yearly" ? STRIPE_PRICE_ID_YEARLY : STRIPE_PRICE_ID_MONTHLY;

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    client_reference_id: session.user.id,
    customer_email: session.user.email,
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?checkout=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?checkout=canceled`,
  });

  return NextResponse.json({ success: true, data: { url: checkoutSession.url } });
}
```

Follows the standard pattern (auth check → Zod → business logic → `{success, data/error}`) unlike the webhook route.

### 2.6 `src/app/api/stripe/create-portal-session/route.ts`

For "Manage subscription" (cancel/update payment method) via Stripe's hosted Customer Portal — avoids building any billing UI ourselves:

```ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getStripeClient } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/db/users";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
  }

  const user = await getCurrentUser();
  if (!user.stripeCustomerId) {
    return NextResponse.json({ success: false, error: "No billing account found" }, { status: 400 });
  }

  const stripe = getStripeClient();
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
  });

  return NextResponse.json({ success: true, data: { url: portalSession.url } });
}
```

(Requires `getCurrentUser()` to expose `stripeCustomerId` — see §3.1.)

### 2.7 `src/components/settings/BillingSection.tsx`

New client component, follows `ChangePasswordSection.tsx`'s "toggle/CTA button" shape, rendered as a fourth `Card` on `/settings`:

- Free user: shows current limits (e.g. "12 / 50 items", "2 / 3 collections" — reuse existing count queries), monthly/yearly toggle (reuse styling from `PricingToggle.tsx`), "Upgrade to Pro" button → `POST /api/stripe/create-checkout-session` → `window.location.href = data.url`.
- Pro user: shows plan status ("Pro — renews Sep 18, 2026" from `stripeCurrentPeriodEnd`, or "Pro — cancels Sep 18, 2026" if `stripeSubscriptionStatus === "canceled"` but still within the period), "Manage subscription" button → `POST /api/stripe/create-portal-session` → redirect.
- Handle `?checkout=success` / `?checkout=canceled` query params (from §2.5's redirect URLs) with a toast, matching the existing `verified=1`/`verifyError` pattern from `SignInForm`.

### 2.8 Tests

- `src/lib/plan-limits.test.ts` — unit tests for `isOverItemLimit`, `isOverCollectionLimit`, `isProOnlyType` (pure logic, matches project's testing scope).
- No tests for `src/lib/stripe.ts` itself (thin SDK wrapper, matches the project's existing untested-passthrough pattern for `r2.ts`).
- Webhook route and checkout/portal routes are not unit-testable under the current Vitest scope (`src/actions/`, `src/lib/` only) — cover manually via Stripe CLI (§4) and the testing checklist (§5).

---

## 3. Files to Modify

### 3.1 `src/lib/db/users.ts`

Extend `getCurrentUser()`'s returned shape and `CurrentUser` type with `stripeCustomerId`, `stripeSubscriptionStatus`, `stripeCurrentPeriodEnd` (needed by `BillingSection.tsx` and the portal-session route).

### 3.2 `src/types/next-auth.d.ts`

Add `isPro` to `Session.user` and to the `JWT` interface:

```ts
declare module "next-auth" {
  interface Session {
    user: { id: string; isPro: boolean } & DefaultSession["user"];
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    isPro?: boolean;
  }
}
```

### 3.3 `src/auth.ts`

Adopt the research note's recommended `jwt` callback — always sync `isPro` from the DB rather than trusting `trigger === "update"`, so webhook-driven changes reach the session on next request:

```ts
callbacks: {
  async jwt({ token, user }) {
    if (user) { token.id = user.id; }
    if (token.id) {
      const dbUser = await prisma.user.findUnique({
        where: { id: token.id as string },
        select: { isPro: true },
      });
      token.isPro = dbUser?.isPro ?? false;
    }
    return token;
  },
  async session({ session, token }) {
    if (session.user) {
      session.user.id = token.id as string;
      session.user.isPro = token.isPro ?? false;
    }
    return session;
  },
},
```

**Trade-off to flag explicitly to the user before implementing:** this adds one DB query per JWT validation, which in Next.js happens on most authenticated requests (middleware + server components), not just page loads. Given `src/proxy.ts` already protects `/dashboard`, `/items`, `/collections`, `/favorites`, `/profile`, `/settings`, this could meaningfully increase Neon round-trips app-wide. Alternatives worth discussing with the user before committing to this approach:
- Keep it (simplest, matches the research note, correctness > minor latency for a webhook-driven flag).
- Only sync on a short TTL (e.g. re-check if `token.isProCheckedAt` is >60s old) — reduces most of the cost while keeping propagation reasonably fast.
- Rely on `trigger === "update"` + have `BillingSection.tsx` call `update()` after redirect back from Checkout/Portal (covers the common "just upgraded" case immediately) and accept up to next-sign-in staleness for the rare webhook-only case (e.g. a failed payment auto-downgrade). This matches the research note's own caveat but was called out as unreliable for the webhook case specifically — so this alone is insufficient without a fallback.

This plan defaults to the research note's "always sync" approach per the spec's explicit instruction, but flag it for confirmation at implementation time given the app-wide latency trade-off.

### 3.4 `src/actions/items.ts`

In `createItem`, after the existing type/URL/file validation and before the DB write, add:

```ts
if (isProOnlyType(typeName) && !session.user.isPro) {
  return { success: false, error: "File and image items require a Pro subscription" };
}

const itemCount = await getItemCountForUser(session.user.id); // new lib/db/items.ts helper
if (isOverItemLimit(itemCount, session.user.isPro)) {
  return { success: false, error: `Free plan is limited to ${FREE_ITEM_LIMIT} items. Upgrade to Pro for unlimited items.` };
}
```

Gate this behind a feature flag (see §3.8) so it can be merged and tested without immediately restricting existing users mid-development, matching the project's existing `EMAIL_VERIFICATION_ENABLED`-style toggle precedent.

### 3.5 `src/actions/collections.ts`

Same pattern in `createCollection`:

```ts
const collectionCount = await getCollectionCountForUser(session.user.id); // new helper
if (isOverCollectionLimit(collectionCount, session.user.isPro)) {
  return { success: false, error: `Free plan is limited to ${FREE_COLLECTION_LIMIT} collections. Upgrade to Pro for unlimited collections.` };
}
```

### 3.6 `src/lib/db/items.ts` / `src/lib/db/collections.ts`

Add thin `getItemCountForUser(userId)` / `getCollectionCountForUser(userId)` passthroughs (`prisma.item.count({ where: { userId } })`) for §3.4/§3.5 to call — left untested per the project's existing pattern for thin Prisma passthroughs.

### 3.7 `src/app/(app)/items/[type]/page.tsx`

Per `docs/item-crud-architecture.md`'s stated (but never implemented) intent: when the resolved type's `isPro` is true and `session.user.isPro` is false, render an upgrade prompt instead of the item list/"Add" button. This closes the gap between that doc and the actual code.

### 3.8 `src/lib/plan-limits.ts` (feature flag)

Add a flag mirroring `src/lib/email-verification.ts`'s pattern, so gating can be toggled off during development/testing without code changes:

```ts
export function isPlanGatingEnabled(): boolean {
  return process.env.PLAN_GATING_ENABLED === "true"; // opt-in, default OFF until launch
}
```

All new checks in §3.4/§3.5/§3.7 should be wrapped: `if (isPlanGatingEnabled() && isOverItemLimit(...))`. This matches `project-overview.md`'s explicit "all users get full access until launch" instruction — gating ships dark by default.

### 3.9 `.env` additions (document in a new `.env.example`)

The project has no `.env.example` currently; this is a good opportunity to add one (documented, not committing real secrets) — flag this as an opportunistic addition, confirm with the user first since it's slightly outside the ticket's literal scope:

```
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID_MONTHLY=
STRIPE_PRICE_ID_YEARLY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
PLAN_GATING_ENABLED=false
```

### 3.10 `package.json`

Add `stripe` (server SDK) to `dependencies`. No `@stripe/stripe-js` needed — Checkout + Customer Portal are both server-initiated redirects, no client-side Stripe.js/Elements required, consistent with this codebase's server-action-first conventions.

---

## 4. Stripe Dashboard Setup Steps

1. Create a Stripe account (or use existing) in **Test mode** first.
2. **Products & Prices**: create one Product ("DevStash Pro") with two recurring Prices — $8.00/month, $72.00/year. Copy both Price IDs into `STRIPE_PRICE_ID_MONTHLY`/`STRIPE_PRICE_ID_YEARLY`.
3. **API keys**: copy the test-mode Secret key into `STRIPE_SECRET_KEY`.
4. **Webhook endpoint**:
   - Local dev: use the Stripe CLI — `stripe listen --forward-to localhost:3000/api/webhooks/stripe` — copy the printed signing secret into `STRIPE_WEBHOOK_SECRET`.
   - Production: add an endpoint in the Dashboard pointing at `https://<domain>/api/webhooks/stripe`, subscribed to at minimum: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`. Copy its signing secret into the production env's `STRIPE_WEBHOOK_SECRET` (different from the CLI's).
5. **Customer Portal**: enable it (Dashboard → Settings → Billing → Customer portal), configure allowed actions (cancel subscription at minimum; update payment method).
6. When ready to go live: repeat steps 2-5 in **Live mode** with live keys, and re-point the production webhook endpoint/price IDs.

---

## 5. Testing Checklist

Manual (per `context/ai-interaction.md`, no Playwright unless explicitly requested — but Stripe flows involve an external redirect, so browser verification is likely warranted here; confirm with the user before launching Playwright):

- [ ] `npm run build` and `npm run test` pass after each implementation step.
- [ ] Free user sees correct item/collection counts and limits on `/settings`.
- [ ] Clicking "Upgrade to Pro" (monthly) redirects to Stripe Checkout with the correct price.
- [ ] Clicking "Upgrade to Pro" (yearly) redirects with the yearly price.
- [ ] Completing test checkout (Stripe test card `4242 4242 4242 4242`) redirects back to `/settings?checkout=success`, webhook fires, `isPro` becomes `true` in DB.
- [ ] Session picks up `isPro: true` (after reload, or immediately if `update()` is also wired — depends on §3.3 decision).
- [ ] Pro user can create File/Image items; free user is blocked with a clear error (with `PLAN_GATING_ENABLED=true`).
- [ ] Free user blocked from creating a 51st item / 4th collection; Pro user is not (with gating enabled).
- [ ] "Manage subscription" opens the Stripe Customer Portal for a Pro user.
- [ ] Canceling in the portal → webhook fires `customer.subscription.deleted` (or `updated` with `status: canceled` depending on cancel-at-period-end setting) → `isPro` flips to `false` at the correct time (immediately vs. at period end — confirm desired behavior with the user).
- [ ] Webhook route rejects requests with an invalid/missing `stripe-signature` header (400, no DB write).
- [ ] Webhook route is idempotent-safe: replaying the same event via Stripe CLI's `stripe trigger` doesn't produce inconsistent state.
- [ ] `PLAN_GATING_ENABLED=false` (default) fully restores current "everyone gets full access" behavior — regression check.
- [ ] Lint passes (`npm run lint`).

---

## 6. Implementation Order

1. **Migration** (§2.1) — add `stripeSubscriptionStatus`, `stripeCurrentPeriodEnd` columns.
2. **`src/lib/stripe.ts`** (§2.2) + install `stripe` package + confirm API version via Context7.
3. **NextAuth session/JWT changes** (§3.2, §3.3) — confirm the "always sync" trade-off with the user first (see §3.3 discussion).
4. **Webhook route** (§2.4) — build and verify end-to-end with `stripe listen` + `stripe trigger checkout.session.completed`/`customer.subscription.updated`/`.deleted` before building any UI.
5. **Checkout + portal session routes** (§2.5, §2.6).
6. **`getCurrentUser()` extension** (§3.1).
7. **`BillingSection.tsx`** (§2.7) wired into `/settings`.
8. **`plan-limits.ts` + feature flag** (§2.3, §3.8) — land with `PLAN_GATING_ENABLED` unset/false.
9. **Gating enforcement** (§3.4, §3.5, §3.7) — behind the flag, so it can be merged safely ahead of actually flipping it on at launch.
10. **Tests** (§2.8), `.env.example` (§3.9, confirm with user), `package.json` (§3.10).
11. Full testing checklist (§5) in Stripe test mode.
12. Flip `PLAN_GATING_ENABLED=true` only when ready to actually enforce limits (separate, deliberate step — not part of this feature's initial merge, per `project-overview.md`'s "full access until launch" stance).

---

## 7. Open Questions for the User

These affect implementation decisions above and should be confirmed before/during implementation (not decided unilaterally):

1. **JWT sync trade-off** (§3.3): accept the extra per-request DB query for immediate correctness, or use a TTL/`update()`-hybrid approach?
2. **Cancellation timing**: does canceling in the portal revoke Pro access immediately, or let it run until `stripeCurrentPeriodEnd` (Stripe's default `cancel_at_period_end` behavior)? Affects the `customer.subscription.updated` vs `.deleted` handling in §2.4.
3. **`.env.example`** (§3.9): OK to add, given none exists today?
4. **Browser verification**: Stripe Checkout is an external redirect — OK to use Playwright for end-to-end testing per §5, as an exception to the project's "no browser verification unless asked" default?
5. Should gating enforcement (§3.4/§3.5/§3.7) be built now-but-flagged-off (as planned above), or deferred entirely to a later feature once billing itself is proven out?
