# Current State

## Checkpoint

**Date:** 2026-10-12

**Overall status:** Stage 2 complete; the internal domain model and controlled fixture league are ready.

## Completed

- Product scope, architecture boundaries, roadmap, and test strategy documented.
- Next.js, TypeScript, formatting, linting, testing, build, and CI foundation configured.
- Next.js and its matching lint configuration updated to 16.4.0 after the Stage 2 audit identified a critical advisory in the previous framework version.
- Stable internal types created for players, weekly statistics, projections, scoring settings, lineup rules, leagues, teams, rosters, trades, and initial analysis results.
- Player positions separated from lineup slots; kicker and SUPERFLEX are supported at the type level without deciding their final release scope.
- Central FLEX and SUPERFLEX eligibility rules implemented and tested.
- Runtime validation implemented for structural data, unique identities, cross-record references, roster ownership, projection keys and ranges, and proposed trades.
- Controlled full-PPR fixture created with two twelve-player teams, known projections, a bye player, an unavailable player, FLEX competition, a tied projection, and a useful second quarterback.
- The fixture loads entirely from local TypeScript without a database or external API.
- AI-agent working rules require a fresh commit-versus-PR decision every time.

## In progress

- None.

## Next recommended action

Start Stage 3 by implementing a pure fantasy-scoring function over normalized weekly statistics and league scoring settings. Define hand-calculated standard, half-PPR, full-PPR, kicker, and defense cases before implementation.

## Not started

- Scoring engine
- Lineup optimizer
- Trade simulator
- Database and external-data ingestion
- Projection and backtesting system
- Sleeper integration
- Trade interface
- Deployment

## Current risks

- The exact supported kicker and team-defense scoring rules must be finalized with Stage 3 tests.
- Kicker and SUPERFLEX inclusion in the first public release remain product decisions even though the domain model can represent them.
- External source schemas and licensing conditions can change.
- Player identity mapping across sources may require manual review.
- Projection quality can be overstated without leakage-safe backtesting.
- Flexible roster positions can make naive lineup algorithms incorrect.
- `npm audit` still reports five high-severity development-tool findings through `eslint-config-next -> fast-glob -> micromatch -> braces`; npm currently offers only a forced downgrade to `eslint-config-next@14.2.35`, so no unsafe forced fix was applied.

## Known open questions

See `docs/DECISIONS.md` for the authoritative pending-decision list.

## Verification performed

- Two read-only subagents independently reviewed the domain design and controlled fixture/test plan; neither changed files or external resources.
- `npm run format` completed.
- `npm run lint` passed with zero warnings.
- `npm run typecheck` passed.
- `npm run test` passed: four test files and twenty-two tests.
- `npm run build` passed with Next.js 16.4.0.
- `npm run check` passed in full after rebuilding from a clean generated cache.
- `npm audit fix` updated `sharp` to 0.35.5 and `source-map-js` to 1.2.2 without forced or breaking changes.
- `npm audit --audit-level=high` confirms the prior critical framework finding is resolved; five high-severity lint-tool findings remain without a non-breaking upstream fix.
