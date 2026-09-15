# Agent Instructions

These instructions apply to every AI coding agent working in this repository.

## Source of truth

Read these files before making changes:

1. `docs/PRODUCT.md`
2. `docs/ARCHITECTURE.md`
3. `docs/ROADMAP.md`
4. `docs/CURRENT_STATE.md`
5. Any task-specific documentation

If documentation and code disagree, stop and identify the conflict. Do not silently choose one.

## Working rules

- Inspect relevant files before editing.
- Work on one roadmap stage or narrowly scoped task at a time.
- Do not expand product scope without explicit approval.
- Preserve unrelated user changes.
- Prefer the simplest implementation that satisfies current requirements.
- Keep domain logic independent from React, databases, and external APIs.
- Access external platforms through adapters that translate into internal types.
- Never invent API fields, dataset columns, licenses, or scoring behavior. Verify them against current documentation and representative fixtures.
- Never place credentials, tokens, cookies, or personal league data in the repository.
- Add or update tests whenever behavior changes.
- Run the relevant formatter, linter, type checker, tests, and production build before declaring work complete.
- Report which checks ran, their results, and any checks that could not run.
- Update `docs/CURRENT_STATE.md`, `docs/ROADMAP.md`, and affected design documents at stage boundaries.
- Before every commit, push, or pull request, ask the user whether to commit directly or use a branch and pull request. A prior answer does not carry forward to later changes.
- Do not commit, push, open a pull request, or modify external resources unless the user requests it.

## Architecture constraints

- The scoring engine, lineup optimizer, projection system, and trade simulator must be deterministic and independently testable.
- The trade engine must consume internal domain types, not Sleeper or nflverse response objects.
- Persist raw football statistics and calculate fantasy points from league scoring settings.
- Store external player identifiers separately from the internal player identity.
- Simulations must not mutate persisted rosters.
- A generative model may eventually explain computed results, but it must not calculate or override the trade score.

## Testing expectations

- Use unit tests for scoring, eligibility, lineup optimization, and trade simulation.
- Use integration tests for database repositories and external-source adapters.
- Use saved, sanitized API responses for repeatable adapter tests.
- Use time-ordered backtests for projections and prevent future-data leakage.
- Use end-to-end tests for the primary import-to-analysis user journey.
- Include edge cases and invalid inputs, not only successful examples.

## Completion format

When finishing a task, summarize:

1. What changed
2. Why it changed
3. Files affected
4. Verification performed
5. Remaining risks or open questions
6. Recommended next step

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
