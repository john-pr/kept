# Portfolio Prep 7 — Flip Repository to Public

## Overview

Final gate. Only run after specs 1–6 are merged, CI is green, and the secret scan is clean.

## Requirements

- Confirm: `ci.yml` green on `master`; `git status` clean; `gitleaks detect
  --log-opts="--all"` reports nothing; README renders locally with working image paths.
- Flip visibility: `gh repo edit john-pr/kept --visibility public
  --accept-visibility-change-consequences` (or via the GitHub settings UI).
- Post-flip verification from a logged-out browser:
  - Repo README renders; CI + license + demo badges resolve.
  - Social preview image shows on a shared link.
  - Live demo URL loads; documented demo credentials sign in successfully.
  - `git clone` + `cp .env.example .env` + documented setup steps are sufficient to run
    locally (dry-read the README once more as if new).

## Notes

- No code changes. Branch: none needed, or `chore/go-public` if any final doc tweaks.
