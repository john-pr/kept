# Portfolio Prep 1 — Repo Hygiene & Secret Scan

## Overview

Pre-public safety gate: confirm no secrets are in git history, close .gitignore gaps, and
remove stale tracked files. Nothing here changes app behavior.

## Requirements

- Run a full git-history secret scan: `gitleaks detect --source . --log-opts="--all"`
  (or the gitleaks GitHub Action on a pre-public PR). gitleaks is not installed locally —
  install first via `scoop install gitleaks` or `winget install gitleaks` (scoop shims are
  already on PATH). Must report zero findings before
  visibility is flipped in spec 7. If anything is found, STOP and raise history rewrite
  (BFG / git filter-repo) as a separate decision — do not proceed.
- Spot-check already done and clean: `.env`, `.env.*`, `.mcp.json` gitignored since the
  first commits and never tracked; no `sk_`/`whsec_`/`AKIA`/private-key strings in
  `src/`, `scripts/`, `prisma/`.
- `.gitignore` additions: `.idea/`, `/playwright-report/`, `/test-results/`.
- `.idea/` is currently **tracked** (6 files, including `.idea/claudeCodeTabState.xml` which
  records local session/tab state) — `git rm -r --cached .idea/` in addition to the
  gitignore entry. Note the files stay in old history; that's acceptable (paths only, no
  secrets), the gitleaks scan is the real gate.
- Confirm `.env.production` (local, gitignored) is not tracked — leave the file in place.
- Remove `context/screenshots/*` (pre-ledger-redesign, no longer representative); real
  screenshots are recaptured in spec 3. Also update `context/project-overview.md` §10,
  which references both screenshot files — drop those two `@context/screenshots/...` lines
  so no context file points at deleted paths.
- Final grep of tracked files for leftover `devstash` / real-name strings; the Neon MCP
  block's literal `devstash` project id in CLAUDE.md is an external identifier — leave it.
- Keep `AGENTS.md`, `CLAUDE.md`, and `.claude/` (agents + skills) tracked — they are part
  of the "how this was built" story.

## Notes

- Read-only/advisory work plus a tiny `.gitignore` edit and one folder deletion.
- Branch: `chore/repo-hygiene`.