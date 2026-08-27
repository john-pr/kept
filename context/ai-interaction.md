# AI Interaction Guidelines

## Communication

- Be concise and direct
- Explain non-obvious decisions briefly
- Ask before large refactors or architectural changes
- Don't add features not in the project spec
- Never delete files without clarification

## Workflow

This is the common workflow that we will use for every single feature/fix:

1. **Document** - Document the feature in @context/current-feature.md.
2. **Branch** - Create new branch for feature, fix, etc
3. **Implement** - Implement the feature/fix that I create in @context/current-feature.md
4. **Test** - Run `npm run build` and fix any errors. Run `npm run test` and fix any failures; add/update unit tests for any server actions or utilities touched by the change. Do not launch a browser (e.g. Playwright) to verify unless I explicitly ask for it.
5. **Iterate** - Iterate and change things if needed
6. **Commit** - Only after build passes and everything works
7. **Merge** - Merge to main
8. **Delete Branch** - Delete branch after merge
9. **Review** - Review AI-generated code periodically and on demand.
10. Reset @context/current-feature.md's Status/Goals/Notes and add the entry to @docs/development-log.md

Do NOT commit without permission and until the build passes. If build fails, fix the issues first.

### History entry format

The development log is `@docs/development-log.md` (earliest to latest, grouped by month).
Keep each entry to ~3-5 sentences. Include: what shipped and the key files touched,
non-obvious decisions/deviations, anything deliberately deferred or left out of scope, and any
real bug found and fixed along the way. Leave out: play-by-play of how it was verified (e.g.
Playwright click-by-click narration, screenshot pixel measurements), a full account of every
follow-up round, and routine "build/lint/test pass" or "merged into master, branch deleted"
notes — those are already implied by the workflow above. Full detail always survives in git
history if it's ever needed; the point of this file is to stay skimmable, not exhaustive.

## Branching

We will create a new branch for every feature/fix. Name branch **feature/[feature]** or **fix[fix]**, etc. Ask to delete the branch once merged.

## Commits

- Ask before committing (don't auto-commit)
- Use conventional commit messages (feat:, fix:, chore:, etc.)
- Keep commits focused (one feature/fix per commit)
- Never put "Generated With Claude" in the commit messages

## When Stuck

- If something isn't working after 2-3 attempts, stop and explain the issue
- Don't keep trying random fixes
- Ask for clarification if requirements are unclear

## Code Changes

- Make minimal changes to accomplish the task
- Don't refactor unrelated code unless asked
- Don't add "nice to have" features
- Preserve existing patterns in the codebase

## Code Review

Review AI-generated code periodically, especially for:

- Security (auth checks, input validation)
- Performance (unnecessary re-renders, N+1 queries)
- Logic errors (edge cases)
- Patterns (matches existing codebase?)
