# Contributing

Kept is primarily a portfolio project, but issues and PRs are welcome.

## Workflow

1. **Branch** off `master`: `feature/<name>`, `fix/<name>`, or `chore/<name>`.
2. **Implement** the change, keeping it focused — one feature or fix per branch.
3. **Verify** before committing:
   ```bash
   npm run build
   npm run lint
   npx tsc --noEmit
   npm run test
   ```
   Add or update tests for any server action (`src/actions/`) or utility (`src/lib/`) you
   touch. There is no component/DOM test setup by design.
4. **Commit** with [Conventional Commits](https://www.conventionalcommits.org/) —
   `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, etc. One logical change per commit.
5. **Open a PR** against `master`. CI runs lint, type-check, and unit tests.
6. If your change ships a feature or fix, add an entry to
   [`docs/development-log.md`](docs/development-log.md).

## Conventions

- **TypeScript strict**, no `any` — use `unknown` or a real type.
- **Server Components by default**; `"use client"` only when it's needed.
- **Server Actions** for mutations (`{ success, data?, error? }` result shape); API routes
  only for webhooks, uploads, and other cases that need the HTTP layer.
- **Tailwind v4** — CSS-based `@theme` config in `src/app/globals.css`, no `tailwind.config`.
- **Prisma migrations** only (`npm run db:migrate`), never `db push`.

See [`context/coding-standards.md`](context/coding-standards.md) for the full list and
[`docs/architecture.md`](docs/architecture.md) for how the pieces fit together.
