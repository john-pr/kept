# Auth Security Review

**Last audited:** 2026-07-30

## Findings

### High

#### 1. No rate limiting or lockout on any sensitive auth endpoint
- **Files:** `src/auth.ts:39-61` (Credentials `authorize`), `src/app/api/auth/register/route.ts:20-66`, `src/app/api/auth/forgot-password/route.ts:10-29`, `src/app/api/auth/resend-verification/route.ts:11-35`, `src/app/api/auth/reset-password/route.ts:18-57`, `src/app/api/auth/change-password/route.ts:18-57`
- **Issue:** A repo-wide search for throttling middleware, in-memory counters, or rate-limit packages (`rate-limit`, `upstash`, `redis`, `limiter`, `lockout`, `attempts`) found none in application code — only an unrelated match in `package-lock.json` and this audit agent's own file. NextAuth v5 does not provide login throttling itself, so this gap is real and unmitigated.
- **Exploit scenario:** An attacker can script unlimited `POST /api/auth/callback/credentials` requests to brute-force a known user's password (bcrypt slows each guess but nothing stops thousands of automated attempts per minute from a botnet/proxy pool). Likewise, `POST /api/auth/register`, `/api/auth/forgot-password`, and `/api/auth/resend-verification` can be hit at unlimited volume to spam a target's inbox with verification/reset emails (cost abuse on the Resend account and harassment of the victim), or to enumerate valid accounts via response-time/status differences (see finding below).
- **Fix:** Add IP- and/or account-based rate limiting (e.g. Upstash Ratelimit, or a simple Redis/DB-backed sliding-window counter) in front of `authorize`, `register`, `forgot-password`, `resend-verification`, and `reset-password`. At minimum, throttle by IP+email combination and add exponential backoff or temporary lockout after N failed credential attempts.

### Medium

#### 2. Timing side-channel leaks account existence on `forgot-password` and `resend-verification`
- **Files:** `src/app/api/auth/forgot-password/route.ts:23-28`, `src/app/api/auth/resend-verification/route.ts:28-32`
- **Issue:** Both routes return the identical `{success: true}` body regardless of whether the account exists, which is the correct approach for the response *body*. However, the code only calls `createAndSendPasswordResetEmail(email)` / `createAndSendVerificationEmail(email)` — which performs a DB write plus a network call to the Resend API — when the user exists, and returns immediately otherwise. This produces a measurable response-time difference between "email exists" and "email does not exist" requests.
- **Exploit scenario:** An attacker sends repeated `POST /api/auth/forgot-password` requests for candidate email addresses and measures response latency; requests for real accounts take noticeably longer (extra DB query + outbound HTTP call to Resend) than requests for non-existent accounts, letting the attacker enumerate valid emails despite the identical JSON response — defeating the anti-enumeration intent documented in `context/current-feature.md`.
- **Fix:** Make both branches do equivalent work before responding, e.g. always perform a dummy-cost operation (or `await` a fixed artificial delay) on the non-existent-user path so response time doesn't correlate with account existence, or fire the email send without awaiting it (respond first, send async) so timing is uniform.

### Low

#### 3. Account deletion does not require re-entering the current password
- **File:** `src/app/api/auth/delete-account/route.ts:5-14`, `src/components/profile/DeleteAccountDialog.tsx:40-54`
- **Issue:** `change-password` correctly requires the current password before allowing a change (`src/app/api/auth/change-password/route.ts:44-47`), but `delete-account` only checks the session (`auth()`) and a client-side "type delete to confirm" UI gate — no server-side password re-verification for credentials users.
- **Exploit scenario:** If a user's session is left active on a shared/public machine or is hijacked (e.g. stolen cookie via malware, or a brief unattended session), an attacker who reaches `/profile` can permanently delete the account and all its data by clicking through the confirmation dialog, without ever knowing the account password. Requiring the password adds a meaningful extra barrier for such an irreversible, high-impact action, consistent with how `change-password` already treats password confirmation as necessary.
- **Fix:** For `hasPassword` users, require `currentPassword` in the `delete-account` request body and verify it with `bcrypt.compare` (mirroring `change-password`) before calling `prisma.user.delete`.

#### 4. Register endpoint reveals whether an email is already registered
- **File:** `src/app/api/auth/register/route.ts:33-39`
- **Issue:** `POST /api/auth/register` returns HTTP 409 with `"A user with this email already exists"` when the email is taken, distinct from validation failures. Combined with the lack of rate limiting (Finding 1), this allows account enumeration at scale.
- **Exploit scenario:** An attacker scripts registration attempts for a list of candidate emails; a 409 response confirms the email has a DevStash account, which can then be targeted for credential-stuffing or phishing. This is a common, accepted UX tradeoff for registration flows (unlike the password-reset flow, which intentionally avoids the leak per spec), so severity is Low rather than Medium — but worth tracking since there's no compensating rate limit.
- **Fix:** Optional/defer: if stronger anti-enumeration guarantees are desired, switch to a generic "if this email can be registered you'll receive a confirmation" response pattern for registration too, or at minimum rate-limit the endpoint per Finding 1 to blunt automated enumeration.

## Passed Checks

- **Password hashing:** `bcrypt.hash(password, 10)` used consistently for registration (`src/app/api/auth/register/route.ts:41`), change-password (`src/app/api/auth/change-password/route.ts:49`), and reset-password (`src/app/api/auth/reset-password/route.ts:45`); no plaintext password is ever stored or logged in any reviewed file.
- **Constant-behavior comparison:** All password checks use `bcrypt.compare` (never a raw `===` string comparison) — `src/auth.ts:51`, `src/app/api/auth/change-password/route.ts:44`.
- **GitHub-only accounts correctly excluded from password flows:** `getCurrentUser()` (`src/lib/db/users.ts:31`) exposes `hasPassword: user.password !== null`, and both the Credentials `authorize` (`src/auth.ts:47`, returns `null` if `user.password` is falsy) and `/api/auth/change-password` (`route.ts:37-42`, returns a 400 "This account does not use a password" instead of attempting a bcrypt compare against `null`) correctly handle OAuth-only users without ever flagging them for "no password hash."
- **Email verification tokens use a cryptographically secure source:** `crypto.randomBytes(32).toString("hex")` (256 bits of entropy) in `src/lib/verification-token.ts:10` — not `Math.random()` or any predictable value.
- **Email verification expiry is enforced server-side, not cosmetic:** `src/app/api/auth/verify-email/route.ts:22` checks `verificationToken.expires < new Date()` before granting verification and deletes the expired token.
- **Email verification tokens are single-use:** deleted immediately after successful consumption (`src/app/api/auth/verify-email/route.ts:41-48`) and also deleted on expiry (`:23-32`); `createAndSendVerificationEmail` additionally purges any prior tokens for that identifier before issuing a new one (`src/lib/verification-token.ts:8`), preventing multiple valid tokens from coexisting.
- **Password reset tokens use the same secure 256-bit `crypto.randomBytes(32)` source** (`src/lib/password-reset-token.ts:13`) and are namespaced with a `reset:` identifier prefix, isolating them from email-verification tokens sharing the same `VerificationToken` table.
- **Password reset expiry is enforced server-side:** `src/app/api/auth/reset-password/route.ts:38` checks `resetToken.expires < new Date()` and rejects/deletes expired tokens before allowing a password update.
- **Password reset tokens are single-use:** deleted immediately after successful consumption (`src/app/api/auth/reset-password/route.ts:52-54`) and also deleted on the expired-token path (`:39-41`).
- **`forgot-password` does not leak account existence in its response body:** always returns `{success: true}` whether or not the email is registered (`src/app/api/auth/forgot-password/route.ts:23-28`) — see Finding 2 for a separate, narrower timing-based caveat on this same endpoint.
- **Profile and account endpoints validate the session server-side before any read/mutation:** `auth()` is called and `session?.user?.id` is checked in `src/app/api/auth/change-password/route.ts:19-22`, `src/app/api/auth/delete-account/route.ts:6-9`, and `src/lib/db/users.ts:15-18` (`getCurrentUser`, used by `/profile`).
- **All account mutations operate only on the authenticated user's own ID, never a client-supplied ID:** `change-password` updates `where: { id: user.id }` derived from `session.user.id` (`src/app/api/auth/change-password/route.ts:36,52`); `delete-account` deletes `where: { id: session.user.id }` (`src/app/api/auth/delete-account/route.ts:11`) with no request-body ID accepted.
- **Change-password requires the current password** for credentials users and verifies it with `bcrypt.compare` before allowing a change (`src/app/api/auth/change-password/route.ts:44-47`) — the client cannot bypass this by omitting or forging the field, since it's validated server-side via Zod (`currentPassword: z.string().min(1)`) and then checked against the stored hash.
- **`/profile` route is protected at the middleware level:** `src/proxy.ts:8-16` redirects unauthenticated requests for `/profile/*` to `/sign-in`, in addition to the server-side `auth()` checks inside the page/API routes themselves (defense in depth).
