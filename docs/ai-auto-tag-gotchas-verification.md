# Verification: `context/features/ai-auto-tag-spec.md` — "CRITICAL: OpenAI SDK & gpt-5-nano gotchas"

Checked against current OpenAI API docs (via Context7, `/websites/developers_openai_api`) on 2026-08-19. Feature is not yet implemented (no `openai` package installed, no `src/lib/openai.ts`), so this is a pre-implementation sanity check of the spec's claims, not a code audit.

## Verdict: mostly correct, but the headline claim overstates it

The spec says: **"gpt-5-nano does NOT work with the Chat Completions API — it returns empty content. You MUST use the Responses API instead."**

This is too absolute. What's actually documented:

- `gpt-5-nano` **is** an officially supported Chat Completions model (`gpt-5-nano-2025-08-07` appears in OpenAI's own list of supported Chat Completions models).
- It's a **reasoning model**. Reasoning models spend part of their output-token budget on invisible "reasoning tokens" before producing visible text. `max_completion_tokens` caps *both* combined.
- If the cap is too low (or the model's default reasoning effort eats the whole budget), the visible `message.content` can come back empty while `usage.output_tokens_details.reasoning_tokens` is nonzero — that's almost certainly the "empty content" symptom the spec is describing, not a hard incompatibility.
- Chat Completions exposes a `reasoning_effort` param (`none | minimal | low | medium | high | xhigh | max`) specifically to control this. Setting it to `"minimal"` or `"none"` and/or raising `max_completion_tokens` is the documented fix — Chat Completions does still work with `gpt-5-nano`.
- That said, OpenAI's own guidance: *"using the Responses API is recommended for reasoning models to achieve superior model intelligence and performance"* — so steering this feature toward the Responses API is still the right call, just not because Chat Completions is broken/non-functional.

**Recommendation:** soften the spec's wording from "does NOT work / MUST use" to "empty-content is a known failure mode with Chat Completions for this reasoning model unless `reasoning_effort` is tuned down and `max_completion_tokens` is sized generously — Responses API is OpenAI's recommended path for reasoning models and sidesteps this, so keep using it," so a future reader doesn't think Chat Completions is categorically incompatible.

## Confirmed still accurate

- `client.responses.create()` API shape — `model`, `input`, `instructions` (system-role equivalent), `text: { format: { type: "json_object" | "json_schema", ... } }` — matches current docs exactly.
- `response.output_text` as the convenience accessor for the text content — confirmed, still the documented pattern.
- `response_format` (Chat Completions) vs `text.format` (Responses) split — confirmed current.
- `max_tokens` deprecated/unsupported for reasoning models, replaced by `max_completion_tokens` — confirmed ("This replaces the deprecated `max_tokens` parameter, which is not compatible with o-series models" — same family of reasoning-model constraint gpt-5-nano falls under).

## Not verifiable from docs (likely empirical, from prior hands-on testing — leave as-is)

These read as findings from actually running the model rather than documented API behavior, so there's no doc source to confirm/deny them either way:

- `zodResponseFormat` "consumes excessive tokens and hits length limits" with gpt-5-nano.
- The model sometimes returning a bare array (`["a","b"]`) instead of the requested `{"tags": [...]}` object shape.

No reason to distrust these — just noting they're not things a docs check can confirm, so keep the defensive handling (`json_object` + manual parsing, accept both shapes) as insurance regardless.

## Everything else in the spec

The other rows in the "Key differences" table (`messages` vs `instructions`+`input`, `completion.choices[0].message.content` vs `response.output_text`, "always normalize tags to lowercase") and the `.env`/`docs/ai-integration-plan.md` notes are all still accurate/current — no changes needed.

## One doc-vs-doc conflict worth flagging

`docs/ai-integration-plan.md` (§2–3, written earlier, greenfield research) recommends **Chat Completions** with `response_format: json_schema` for auto-tagging, and explicitly says "no need for the stateful Responses API." That directly contradicts this spec's Responses-API mandate. Since the spec's gotchas section is the more recent, hands-on-tested source, treat `ai-auto-tag-spec.md` as authoritative when implementing and update `ai-integration-plan.md`'s auto-tag section (and the shared `src/lib/openai.ts` design, if summary/explain/optimize also turn out to need Responses API for the same reasoning-token reason) accordingly — flagged here rather than silently edited, since that file documents the broader four-feature plan.
