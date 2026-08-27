# Portfolio Prep 6 — Lighthouse & Accessibility Pass

## Overview

Fill the missing favicon / OG-image gap and do a targeted Lighthouse + axe pass on the
key routes, fixing only quick, low-risk wins.

## Requirements

- `public/` is currently empty. Add a favicon set plus `src/app/icon.png`,
  `src/app/apple-icon.png`, and `src/app/opengraph-image.png` (static asset or the Next
  `ImageResponse` file convention). There is no favicon or social image at all today.
- Verify `src/app/layout.tsx` `generateMetadata` sets `description`, `openGraph`, and
  `twitter`. Add what's missing. `<html lang>` is already handled by next-intl.
- Run Lighthouse (Chrome via Playwright, or `@lhci/cli`) against the deployed `/`,
  `/dashboard`, and `/items/snippets`.
- Fix only quick wins surfaced: color-contrast leftovers, missing `alt` text, tap-target
  sizes, `<label>` / control associations flagged by axe. Do NOT undertake structural
  refactors here — log anything larger as a separate follow-up.
- Record before/after scores in a short `docs/quality.md` (or a section of
  `docs/architecture.md`). Target ≥95 performance, ≥95 accessibility, 100 best-practices.
- Optional: commit `.lighthouserc.json` + a non-blocking `lighthouse.yml` workflow.

## Notes

- Branch: `chore/lighthouse-pass`. Some fixes may touch shared `src/components/ui/*`; if a
  fix would violate the design-system "don't edit ui primitives" rule, flag it instead of
  making it.
