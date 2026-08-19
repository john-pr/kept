# AI Integration Plan — OpenAI `gpt-5-nano`

Research for integrating OpenAI's `gpt-5-nano` into DevStash for the four
Pro-only AI features listed in `project-overview.md` §3.6:

- Auto-tag suggestions
- AI-generated summaries
- "Explain this code"
- Prompt optimizer

This is a **greenfield integration** — no `openai` package is installed and
no AI code exists yet. `OPENAI_API_KEY` is already scaffolded (empty) in
`.env.example`, and the Pro-gating primitives it needs (`isPro` on the
session, `isPlanGatingEnabled()`) already exist from the Stripe integration.

---

## 1. SDK Setup

Install the official SDK:

```bash
npm install openai
```

### Lazy client, mirroring `src/lib/stripe.ts` / `src/lib/r2.ts`

Every external-service wrapper in this codebase (`stripe.ts`, `r2.ts`)
uses a lazy, throwing getter instead of instantiating a client at module
load time — this avoids build-time crashes when the env var isn't set
(e.g. CI, or a fresh clone before `.env` is filled in) and matches the
existing pattern reviewers will expect.

```ts
// src/lib/openai.ts
import OpenAI from "openai";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

let client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!OPENAI_API_KEY) {
    throw new Error("OpenAI is not configured. Missing OPENAI_API_KEY.");
  }
  if (!client) {
    client = new OpenAI({ apiKey: OPENAI_API_KEY, maxRetries: 2 });
  }
  return client;
}

export const AI_MODEL = "gpt-5-nano";
```

`maxRetries: 2` (SDK default) covers transient 429/5xx with the SDK's
built-in exponential backoff — no need to hand-roll retry logic for the
non-streaming, low-stakes calls this feature needs.

### Where the client is used

Only ever import `getOpenAIClient()` from **server-only** code — API
routes or Server Actions marked `"use server"`. Never from a Client
Component or anything that could end up in a client bundle; the API key
must never reach the browser (see §7).

---

## 2. Feature-by-feature request shape

All four features are single-turn, non-conversational transformations of
data the server already has (an `Item`'s `title`/`content`/`description`,
or freeform prompt text). None need multi-turn chat history, so the
Chat Completions API (`client.chat.completions.create`) is the right
level — no need for the stateful Responses API or Assistants API.

| Feature | Input | Output shape | Structured output? |
|---|---|---|---|
| Auto-tag suggestions | `item.title`, `item.content`/`description` | `string[]` (3–5 tags) | Yes — JSON schema |
| AI summary | `item.content` | Plain text, 1–3 sentences | No — plain text sufficient |
| Explain this code | `item.content`, `item.language` | Markdown explanation | No — streamed markdown |
| Prompt optimizer | user's draft prompt text | Rewritten prompt text | No — streamed text |

### Structured outputs for auto-tagging

Auto-tagging is the one feature where the result is consumed as data
(tags get written to the `Tag` table), not displayed as prose — use
`response_format: json_schema` with `strict: true` so the model can't
return malformed JSON that needs defensive parsing:

```ts
const completion = await client.chat.completions.create({
  model: AI_MODEL,
  messages: [
    { role: "developer", content: "You suggest concise, lowercase tags for a developer's saved snippet/note. Return 3-5 tags." },
    { role: "user", content: `Title: ${title}\n\nContent:\n${content.slice(0, 4000)}` },
  ],
  response_format: {
    type: "json_schema",
    json_schema: {
      name: "tag_suggestions",
      strict: true,
      schema: {
        type: "object",
        properties: {
          tags: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 5 },
        },
        required: ["tags"],
        additionalProperties: false,
      },
    },
  },
});
```

Prefer this over `openai/helpers/zod`'s `zodResponseFormat` unless a Zod
schema is already needed for something else — the raw JSON schema avoids
an extra dependency surface for a shape this small. If more structured
features are added later, revisit `zodResponseFormat` for DRYness.

### Truncate input content

Cap `content` sent to the model (e.g. `slice(0, 4000)` chars, roughly
1000 tokens) before building the prompt — snippets/notes can be
arbitrarily large (no size limit on `Item.content` in the schema) and
there's no reason to pay for or wait on tokens beyond what a tag/summary
needs. Explain-code should allow a larger cap (e.g. 8000 chars) since
code needs more context to explain accurately.

---

## 3. Server Action vs. API Route

Per `coding-standards.md`, Server Actions are the default for mutations;
API routes are reserved for webhooks, streaming/progress, long-running
work, or specific status codes. AI calls split across both:

- **Auto-tag suggestions** → **Server Action** (`src/actions/ai.ts`).
  Single request/response, no streaming needed, fits the existing
  `updateItem`/`createItem` pattern exactly (Zod-validate → `auth()` →
  ownership check → Pro-gate → call OpenAI → return `ActionResult<T>`).

- **AI summary** → **Server Action**, same reasoning — short output, no
  benefit from streaming a 1–3 sentence summary.

- **Explain this code** → **API Route** (`src/app/api/ai/explain/route.ts`).
  Output is a longer markdown explanation; streaming meaningfully
  improves perceived latency, and Server Actions cannot stream a
  response back to a `"use client"` component. Use `stream: true` and
  proxy chunks through a `ReadableStream` / `Response` in the route
  handler (or the SDK's `.toReadableStream()` helper).

- **Prompt optimizer** → **API Route**, same streaming reasoning as
  Explain — a rewritten prompt can be long enough that streaming helps.

This mirrors the project's existing split: `createCheckoutSession` is a
route (external redirect, not a simple mutation) while `createItem` is
an action (form submission, immediate structured result).

### Server Action pattern (auto-tag / summary)

```ts
// src/actions/ai.ts
"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { getItemOwnerId } from "@/lib/db/items";
import { getOpenAIClient, AI_MODEL } from "@/lib/openai";
import { isPlanGatingEnabled } from "@/lib/plan-limits";
import { checkRateLimit } from "@/lib/rate-limit";

const suggestTagsSchema = z.object({ itemId: z.string().trim().min(1) });

interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function suggestTags(itemId: string): Promise<ActionResult<string[]>> {
  const parsed = suggestTagsSchema.safeParse({ itemId });
  if (!parsed.success) return { success: false, error: "Invalid input" };

  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  if (isPlanGatingEnabled() && !session.user.isPro) {
    return { success: false, error: "AI features require a Pro plan" };
  }

  const ownerId = await getItemOwnerId(itemId);
  if (!ownerId) return { success: false, error: "Item not found" };
  if (ownerId !== session.user.id) return { success: false, error: "Not authorized" };

  const rl = await checkRateLimit("ai-suggest-tags", session.user.id, 20, 3600);
  if (!rl.success) return { success: false, error: "Too many AI requests. Try again later." };

  // ...fetch item content, call getOpenAIClient(), return { success: true, data: tags }
}
```

This follows the exact ownership-check order already established by
`updateItem`/`toggleItemFavorite` (Zod → session → ownership →
domain-specific gate), just with the Pro/rate-limit checks inserted
after auth, before the expensive external call.

### API Route pattern (streaming)

```ts
// src/app/api/ai/explain/route.ts
import { auth } from "@/auth";
import { getItemOwnerId } from "@/lib/db/items";
import { getOpenAIClient, AI_MODEL } from "@/lib/openai";
import { isPlanGatingEnabled } from "@/lib/plan-limits";
import { checkRateLimit, getRequestIp, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ success: false, error: "Not authenticated" }, { status: 401 });
  }
  if (isPlanGatingEnabled() && !session.user.isPro) {
    return Response.json({ success: false, error: "AI features require a Pro plan" }, { status: 403 });
  }

  const { itemId } = await request.json();
  const ownerId = await getItemOwnerId(itemId);
  if (!ownerId || ownerId !== session.user.id) {
    return Response.json({ success: false, error: "Item not found" }, { status: 404 });
  }

  const rl = await checkRateLimit("ai-explain", `${getRequestIp(request)}:${session.user.id}`, 10, 3600);
  if (!rl.success) return rateLimitResponse(rl.reset);

  const client = getOpenAIClient();
  const stream = await client.chat.completions.create({
    model: AI_MODEL,
    stream: true,
    messages: [
      { role: "developer", content: "Explain this code concisely for a developer. Use markdown." },
      { role: "user", content: /* item content, truncated */ "" },
    ],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content ?? "";
        if (delta) controller.enqueue(encoder.encode(delta));
      }
      controller.close();
    },
  });

  return new Response(readable, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
```

On the client, consume with `response.body.getReader()` (or a small
`fetch` + `ReadableStream` reader loop) appending chunks to state —
no extra dependency needed for this app's scope (the Vercel AI SDK's
`useChat`/`useCompletion` would be overkill for four single-shot,
non-conversational features).

---

## 4. Pro Gating

Reuse the existing `PLAN_GATING_ENABLED` flag and `session.user.isPro`
exactly as Stripe Phase 2 does for item/collection limits — **do not**
invent a separate AI-specific flag. Per `project-overview.md` §6, all
users get full access (including AI) until launch, so:

```ts
if (isPlanGatingEnabled() && !session.user.isPro) {
  return { success: false, error: "AI features require a Pro plan" };
}
```

This one `if` block is the entire gating surface — it's off by default
today (matching every other gated feature in the app) and turns on
globally the same day item/collection limits do.

### UI gating

Follow the sidebar's existing pattern (`SidebarNav.tsx`'s "PRO" badge,
shown only when `isProOnlyType && !userIsPro`): AI action buttons
("Suggest tags", "Summarize", "Explain", "Optimize prompt") render for
everyone, but when `isPlanGatingEnabled() && !session.user.isPro`, show
a small "PRO" badge on the button and route the click to `/upgrade`
instead of calling the action — consistent with how the app already
teases Pro features (upgrade page + subtle CTA, already shipped) rather
than hiding them outright.

---

## 5. Rate Limiting

Reuse `src/lib/rate-limit.ts` as-is — it's a generic
`checkRateLimit(name, identifier, limit, windowSeconds)` already used by
every sensitive route in the app (register, forgot-password,
change-password, login). AI calls cost real money per request, so they
need a *tighter* limit than auth routes, keyed by user (not just IP,
since a signed-in feature should limit per-account regardless of IP):

| Feature | Suggested limit | Identifier |
|---|---|---|
| Suggest tags | 20/hour | `userId` |
| Summarize | 20/hour | `userId` |
| Explain code | 10/hour | `userId` (heavier output) |
| Optimize prompt | 10/hour | `userId` |

These are starting points, not hard requirements — tune against actual
`gpt-5-nano` pricing once available in the OpenAI dashboard for this
account. The limiter already fails open if Upstash isn't configured, so
no behavior changes for local dev without Redis set up.

Consider also using OpenAI's own project-level rate limits (dashboard
config, or `openai_project_rate_limit` if ever managed via Terraform) as
a hard backstop independent of the app's own limiter — that protects
against bugs in the app-level check, not just abuse.

---

## 6. Cost Optimization

- **`gpt-5-nano`** is already the cheapest current-generation model in
  the family — no further model-tier decision needed, just keep the
  `AI_MODEL` constant in one place (`src/lib/openai.ts`) so a future
  swap is a one-line change.
- **Truncate inputs** (§2) — the single biggest cost lever. A 50KB
  snippet shouldn't be sent in full for a tag-suggestion call.
- **Cap output tokens** via `max_completion_tokens` — tags need maybe
  50 tokens, summaries 150, explanations/prompt-rewrites more (500–1000).
  Set a per-feature cap rather than relying on the model to naturally
  stop.
- **No retries on user-facing latency-sensitive paths beyond the SDK
  default (2)** — retrying a 3rd/4th time just to eventually fail is
  wasted spend; surface the error and let the user retry manually.
- **Cache nothing content-addressed for now** — item content changes
  freely and these are cheap/fast calls; a caching layer would add
  complexity (invalidation on edit) disproportionate to `gpt-5-nano`'s
  cost. Revisit only if usage data shows repeated identical calls.
- **Track usage** — log `completion.usage.total_tokens` per call (or
  pull from OpenAI's dashboard) once real traffic exists, to validate
  the rate limits in §5 are calibrated correctly before raising them.

---

## 7. Security

- **API key**: `OPENAI_API_KEY` stays server-only, read via
  `process.env` inside `src/lib/openai.ts` — never prefixed `NEXT_PUBLIC_`,
  never passed to a Client Component prop. This matches how
  `STRIPE_SECRET_KEY`/`R2_SECRET_ACCESS_KEY` are already handled; the
  existing `.env`/`.env.production` git-ignore setup needs no changes.
- **Input sanitization / prompt injection**: item content is
  user-authored and gets interpolated directly into the prompt sent to
  OpenAI. This app doesn't execute anything based on the model's output
  (no tool-calling, no code execution) — the two features that consume
  structured output (auto-tag) already constrain it via `strict: true`
  JSON schema, so a prompt-injection attempt in an item's content can at
  worst produce a bad tag suggestion, not an unbounded action. No HTML
  is rendered unescaped from AI output either — summaries/explanations
  render through the same markdown pipeline already used for Notes/
  Prompts (`react-markdown` + `remark-gfm`, per the Markdown Editor
  feature), which already sanitizes HTML by default.
- **Ownership checks before spend**: every action/route above validates
  item ownership (`getItemOwnerId`) *before* calling OpenAI, so a user
  can never trigger a billed API call against another user's content —
  same ordering the app already uses for delete/update.
- **Don't log full prompts/content** in server logs or error messages
  returned to the client — return generic errors ("Something went
  wrong generating suggestions") and log details server-side only, to
  avoid leaking other users' item content in stack traces or Sentry-like
  tooling if one is added later.

---

## 8. UI Patterns

Reuse existing primitives rather than introducing new ones:

- **Loading state**: the app already has a `Loader2`/`animate-spin`
  pattern (`PageLoading`, used in every route's `loading.tsx`) — reuse
  it inline on the action button (icon swaps to a spinner, button
  disabled) rather than a full-page loader, since AI actions happen
  inside the already-open `ItemDrawer`/`NewItemDialog`.
- **Accept/reject suggestions** (auto-tag specifically, since it
  mutates structured data): show suggested tags as removable badge
  chips *appended* to the existing tag input, not auto-saved — the user
  clicks each one to add it (or an "Add all" button), then still hits
  the existing Save button. This matches the drawer edit form's existing
  "nothing persists until Save" model (`ItemDrawerEditForm.tsx`) instead
  of introducing a new confirm/reject dialog.
- **Summary / Explain / Optimize** are read-only prose output, not data
  to accept/reject — render them in a dismissible panel (e.g. below the
  content field, closable) with a "Copy" button matching the existing
  `CodeEditor`/`MarkdownEditor` copy-button pattern, rather than writing
  them back into any field automatically. Prompt Optimizer is the one
  exception where the output plausibly replaces the input — give it an
  explicit "Use this" button that copies the rewritten text into the
  source field, rather than auto-replacing.
- **Streaming render** (Explain, Optimizer): append chunks into a
  `useState<string>` as they arrive, rendering through the same
  `.markdown-preview` CSS class already defined in `globals.css` for
  Prompt/Note content, so streamed output looks identical to static
  markdown elsewhere in the app.
- **Errors**: `sonner` toast on failure, matching every other action in
  the app (`toast.error(result.error)`), including the specific
  "AI features require a Pro plan" and rate-limit messages.

---

## 9. New Files Summary

| File | Purpose |
|---|---|
| `src/lib/openai.ts` | Lazy OpenAI client + `AI_MODEL` constant |
| `src/actions/ai.ts` | `suggestTags`, `summarizeItem` server actions |
| `src/app/api/ai/explain/route.ts` | Streaming code explanation |
| `src/app/api/ai/optimize-prompt/route.ts` | Streaming prompt optimization |
| `src/components/items/AiSuggestTags.tsx` (or similar) | Suggested-tag chips UI in the drawer edit form |
| `src/components/items/AiOutputPanel.tsx` (or similar) | Shared dismissible panel for summary/explain/optimize output, with streaming + copy |

`.env.example` needs no change (`OPENAI_API_KEY` already present); local
`.env` needs the actual key filled in before this can be tested live.

No schema changes are required — tags already exist as a first-class
`Tag` model, and summaries/explanations are ephemeral (not persisted),
so no new `Item` columns are needed unless a future spec asks to cache
the summary on the item itself.
