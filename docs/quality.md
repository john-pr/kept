# Quality — Accessibility & Lighthouse

## Accessibility (axe-core)

`tests/e2e/a11y.spec.ts` runs `@axe-core/playwright` against three routes with the
`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa` rule tags and fails on any **serious** or
**critical** violation. Part of the E2E suite (`npm run test:e2e`).

| Route | Before | After |
|---|---|---|
| `/` (marketing) | clean | clean |
| `/dashboard` | 10 × `color-contrast` (serious) | clean |
| `/items/snippets` | 10 × `color-contrast` (serious) | clean |

### Fixes (2026-08-27)

All violations were the same class — sub-4.5:1 text contrast in the sidebar chrome, from the
2026-08-26 "dim zero-count types" pass:

- **`SidebarNav.tsx`** — zero-count item-type rows dimmed via `opacity-60` on the whole row,
  which dragged the `text-muted-foreground` count ("00") to **2.71:1** on the page
  background. Replaced with a real muted color on the label (keeps the "dimmed" read at
  ~5.3:1) and `opacity-60` scoped to the decorative icon chip only. The active row keeps full
  `text-foreground`, and its count is bumped to `text-foreground` too — `text-muted-foreground`
  on the active row's `bg-muted` is only 4.35:1.
- **`UserFooter.tsx`** — the square avatar's initials (`text-muted-foreground` on `bg-muted`,
  4.35:1) switched to `text-ink-body` (~7.8:1). Call-site override; `ui/avatar.tsx` untouched.

Both changes are in screen-owning components, not `src/components/ui/*` primitives.

### Not changed here (larger, logged as follow-ups)

- Nothing structural was surfaced. `/`, the auth pages, and the item drawer were clean.

## Lighthouse

A full Lighthouse run belongs against the **deployed** site (Vercel edge, real network) —
local `next start` numbers don't transfer. Captured at deploy time (portfolio-prep 7).

- **`.lighthouserc.json`** — desktop preset, 3 runs of `/`; asserts accessibility ≥ 0.95
  (error) and performance / best-practices / SEO as warnings.
- **`.github/workflows/lighthouse.yml`** — `workflow_dispatch` + weekly cron, `continue-on-error`,
  runs `@lhci/cli autorun` against the deployed homepage. Non-blocking.

### Targets

| Category | Target |
|---|---|
| Performance | ≥ 95 |
| Accessibility | ≥ 95 |
| Best practices | 100 |
| SEO | ≥ 95 |

### Scores

| Date | Perf | A11y | Best practices | SEO |
|---|---|---|---|---|
| _pending first deploy run_ | — | — | — | — |

## Metadata / social

`src/app/layout.tsx` `generateMetadata` now sets `metadataBase`, a title template,
`openGraph`, and `twitter` (`summary_large_image`). `src/app/opengraph-image.tsx` generates
a 1200×630 card via `next/og` `ImageResponse` in the ledger palette. Favicon set
(`favicon.ico`, `icon.svg`, `apple-icon.png`) already existed.
