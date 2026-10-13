# Current State

## Checkpoint

**Date:** 2026-10-13

**Overall status:** Stage 5 complete; valid two-team trades can be simulated on copied rosters without changing the imported snapshot.

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
- Exact lineup optimizer implemented with maximum-cardinality, minimum-cost flow over roster players and expanded lineup slots.
- The optimizer fills as many required slots as possible before maximizing expected points, preventing negative projections from incorrectly creating optional empty slots.
- Fixed slots, FLEX, SUPERFLEX, optional K, and DST use the central eligibility rules and prevent the same player from filling multiple positions.
- Optimizer results include assignments, bench players, repeated unfilled slot types, and the exact projected total.
- Missing projections safely contribute zero points, while duplicate identities, invalid rules, unknown roster players, duplicate roster entries, non-finite projections, and ambiguous duplicate projections return structured `LineupOptimizationError` failures.
- A separate recursive brute-force reference verifies the production algorithm across 1,000 deterministic generated roster and lineup configurations using five independent seeds.
- Both controlled fixture teams have manually checked optimal-lineup totals, and targeted tests cover greedy failures, byes, injuries, ties, negative projections, missing positions, immutability, empty inputs, and a thirty-player roster.
- Pure `simulateTrade` engine implemented over internal `LeagueSnapshot` and `TradeProposal` types without React, database, or external-platform dependencies.
- One-for-one and uneven two-for-one and three-for-two exchanges remove outgoing players, preserve retained-player order, and append incoming players in proposal order.
- Trade validation now distinguishes nonexistent players from known players sent by the wrong team and provides explicit empty-side messages.
- Simulation returns new roster objects and arrays; frozen-input and repeated-simulation tests prove the original snapshot and proposal are not mutated.
- A trade-to-lineup integration test proves a legal exchange can create and report an unfilled starting position.
- Five hundred deterministic generated uneven trades verify player conservation, exclusive ownership, exact roster-size arithmetic, transfer direction, and incoming-player ordering.
- The user will personally design the baseline projection formula; AI assistance at that stage is limited to requested support, testing, leakage prevention, and backtesting unless the user explicitly expands the scope.
- AI-agent working rules require a fresh commit-versus-PR decision every time.

## In progress

- None.

## Next recommended action

Start Stage 6 by combining trade simulation with the lineup optimizer. Calculate each team's before-and-after lineup totals and identify which players enter and leave the starting lineup.

## Not started

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
- The optimizer supports SUPERFLEX technically, but whether SUPERFLEX must ship in Version 1 remains a product decision.
- `npm audit` still reports five high-severity development-tool findings through `eslint-config-next -> fast-glob -> micromatch -> braces`; npm currently offers only a forced downgrade to `eslint-config-next@14.2.35`, so no unsafe forced fix was applied.

## Known open questions

See `docs/DECISIONS.md` for the authoritative pending-decision list.

## Stage 5 verification

- `npm run format:check` passed.
- `npm run lint` passed with zero warnings.
- `npm run typecheck` passed.
- `npm run test` passed with seven test files and eighty-nine tests, including 1,000 generated optimizer comparisons and 500 generated uneven trades.
- `npm run build` passed with Next.js 16.4.0.
- `npm run check` passed in full.
- `npm audit --audit-level=critical` passed with no critical findings; the previously documented five high-severity development-only lint-chain findings remain.
- The local browser test remains unavailable because this workspace lacks Playwright's Chromium binary; GitHub CI installs it and runs the unchanged smoke test after publication.
