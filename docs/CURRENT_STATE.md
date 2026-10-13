# Current State

## Checkpoint

**Date:** 2026-10-13

**Overall status:** Stage 3 complete; normalized weekly statistics can be converted into league-specific fantasy points.

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
- Pure `calculateFantasyPoints` scoring function implemented independently from React, databases, and external APIs.
- Direct statistic-to-event scoring implemented for passing, rushing, receiving, turnovers, kicking, and team-defense counting statistics.
- Exclusive team-defense points-allowed tiers implemented for 0, 1–6, 7–13, 14–20, 21–27, 28–34, and 35-plus points.
- Missing normalized counting statistics default to zero, missing scoring multipliers contribute zero, and nullable points allowed distinguishes non-defense records from shutouts.
- Hand-calculated standard, half-PPR, full-PPR, passing, decimal, negative-yardage, kicker, and defense examples are covered by unit tests.
- AI-agent working rules require a fresh commit-versus-PR decision every time.

## In progress

- None.

## Next recommended action

Start Stage 4 by implementing a lineup optimizer for fixed positions and FLEX. Establish a brute-force reference implementation first, then compare the production optimizer against it across fixture and generated rosters.

## Not started

- Lineup optimizer
- Trade simulator
- Database and external-data ingestion
- Projection and backtesting system
- Sleeper integration
- Trade interface
- Deployment

## Current risks

- Kicker and SUPERFLEX inclusion in the first public release remain product decisions even though the domain model can represent them.
- The scoring engine intentionally supports only the normalized events listed in `scoringEvents`; platform adapters must report unsupported source scoring fields rather than silently claim complete compatibility.
- External source schemas and licensing conditions can change.
- Player identity mapping across sources may require manual review.
- Projection quality can be overstated without leakage-safe backtesting.
- Flexible roster positions can make naive lineup algorithms incorrect.
- `npm audit` still reports five high-severity development-tool findings through `eslint-config-next -> fast-glob -> micromatch -> braces`; npm currently offers only a forced downgrade to `eslint-config-next@14.2.35`, so no unsafe forced fix was applied.

## Known open questions

See `docs/DECISIONS.md` for the authoritative pending-decision list.

## Stage 3 verification

- `npm run format:check` passed.
- `npm run lint` passed with zero warnings.
- `npm run typecheck` passed.
- `npm run test` passed with five test files and forty-four tests.
- `npm run build` passed with Next.js 16.4.0.
- `npm run check` passed in full.
- `npm run test:e2e` could not start locally because this workspace lacks Playwright's Chromium binary. `npx playwright install chromium` was attempted, but the restricted download returned empty archives. CI remains configured to install the browser and run this unchanged smoke test after the repository update.
