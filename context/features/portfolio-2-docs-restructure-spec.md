# Portfolio Prep 2 — Docs Trim & Reorganize

## Overview

Restructure the dev-process docs so a visitor sees a clean, skimmable trail instead of a
60KB internal log. Keep the spec-driven story; cut the course framing and stubs.

## Requirements

- Target layout:
  - `docs/architecture.md` (new)
  - `docs/development-log.md` (moved + compressed from `context/current-feature.md` history)
  - `docs/specs/` (curated subset of `context/features/*` + a one-line index README)
  - `docs/research/` (keep `docs/ai-integration-plan.md`, `stripe-integration-plan.md`,
    `item-crud-architecture.md`, `item-types.md`, `ai-auto-tag-gotchas-verification.md`)
  - `docs/images/` (populated in spec 3)
  - `docs/audits/` (move the existing `docs/audit-results/AUTH_SECURITY_REVIEW.md` here —
    it's a genuine portfolio asset showing the security-review process; skim it first for
    anything that reads as an unfixed vulnerability and confirm each finding was addressed
    or annotate it, before it goes public)
- `context/current-feature.md`: move the `## History` section to `docs/development-log.md`,
  hard-compress each entry to the 3–5 sentence format its own header already prescribes,
  strip "KURSY UDEMY" / Udemy references and internal-only parentheticals. Leave
  `context/current-feature.md` as the bare Status/Goals/Notes template (still referenced by
  `ai-interaction.md` and CLAUDE.md).
- `context/features/`: keep substantive specs as `docs/specs/`; drop sub-500-byte stubs
  (`add-pro-bash-sidebar.md`, `image-display-spec.md`, `file-display-spec.md`, etc.).
  Add `docs/specs/README.md` indexing what remains, one line each. Keep the
  `portfolio-*-spec.md` files in `context/features/` until each is completed, then fold
  them into `docs/specs/` too.
- Keep in `context/` (light edit only — scrub course framing): `project-overview.md`,
  `coding-standards.md`, `design-system.md`, `ai-interaction.md`.
- New `docs/architecture.md` covering: Prisma data model (walkthrough of the schema),
  routing map, auth flow (NextAuth v5 split config, credentials + GitHub OAuth,
  verification/reset tokens, rate limiting), AI pipeline (`src/lib/openai.ts` →
  `src/lib/{auto-tag,description,explain,optimize-prompt}.ts` → `src/actions/ai.ts`),
  file upload (R2), plan gating (`src/lib/plan-limits.ts`), i18n (cookie-based next-intl).
  Include one Mermaid ER diagram and one request-flow diagram. Assemble from the existing
  `docs/item-crud-architecture.md`, `docs/item-types.md`, `project-overview.md` §4–5.
- Update any moved-path references in `CLAUDE.md`.

## Notes

- Docs only. Branch: `docs/portfolio-restructure`.