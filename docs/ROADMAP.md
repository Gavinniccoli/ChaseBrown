# Roadmap

## Rules

- Complete stages in order unless a documented decision changes the dependency.
- A stage is complete only when its exit criteria pass.
- Every stage updates `docs/CURRENT_STATE.md`.
- Application code has not started; all stages are currently planned.

## Stage 0 — Product foundation

**Build:** Confirm Version 1 scope, product principles, architecture boundaries, and open decisions.

**Test:** Review documents for contradictions and ensure every proposed MVP feature supports the core user flow.

**Exit:** `PRODUCT.md`, `ARCHITECTURE.md`, `ROADMAP.md`, and `DECISIONS.md` agree.

## Stage 1 — Repository and quality foundation

**Build:** Scaffold Next.js and TypeScript; add formatting, linting, testing, type checking, environment validation, and continuous integration.

**Test:** Run one test locally and in CI.

**Exit:** Development server, lint, type check, test suite, and production build all pass.

## Stage 2 — Domain model and fixture league

**Build:** Define internal types for players, statistics, projections, league rules, teams, rosters, trades, and results. Create a controlled fixture league.

**Test:** Reject invalid positions, duplicate IDs, and invalid trade references.

**Exit:** Both fixture rosters load without a database or external API.

## Stage 3 — Scoring engine

**Build:** Calculate fantasy points from raw statistics and arbitrary supported league scoring settings.

**Test:** Hand-calculated standard, half-PPR, PPR, decimal, zero, and negative-stat cases.

**Exit:** All supported scoring examples match exact expected values.

## Stage 4 — Lineup optimizer

**Build:** Select the highest-projected valid lineup for QB, RB, WR, TE, FLEX, optional K, and DST.

**Test:** Eligibility, duplicate prevention, missing positions, bye weeks, ties, and cases where a greedy choice fails.

**Exit:** Production results match a brute-force reference across fixtures and generated rosters.

## Stage 5 — Trade simulator

**Build:** Validate and apply one-for-one and uneven two-team trades to copied rosters.

**Test:** Invalid ownership, duplicate players, nonexistent players, open slots, and original-roster immutability.

**Exit:** Legal trades produce exact expected rosters; invalid trades return clear domain errors.

## Stage 6 — Basic trade analysis

**Build:** Optimize each team before and after a trade and report lineup totals and changed starters.

**Test:** Manually calculate at least ten scenarios covering all positive/negative impact combinations.

**Exit:** Program results match the manual calculations.

## Stage 7 — Database and repositories

**Build:** Add PostgreSQL, select an ORM, create migrations, constraints, repositories, and seed data.

**Test:** Migration from empty database, uniqueness, foreign keys, upserts, and deletion behavior.

**Exit:** A fresh database can be created and seeded reproducibly.

## Stage 8 — Historical-statistics ingestion

**Build:** Import, validate, normalize, and upsert one nflverse season.

**Test:** Repeat import, malformed rows, partial failure, expected counts, and duplicate detection.

**Exit:** Importing the season twice creates no duplicate player-week records.

## Stage 9 — Player identity resolution

**Build:** Map internal players to nflverse and Sleeper identifiers and report unresolved records.

**Test:** Suffixes, punctuation, duplicate names, team changes, rookies, and team defenses.

**Exit:** Fantasy-relevant unmatched records are visible and no ambiguous match is silently accepted.

## Stage 10 — Baseline projections

**Build:** Generate versioned weekly expected, low, and high projections using transparent historical and opportunity inputs.

**Test:** Weight calculations, byes, missing history, rookies, small samples, and outcome ordering.

**Exit:** Every supported active player receives a projection or an explicit reason for exclusion.

## Stage 11 — Projection backtesting

**Build:** Run time-ordered historical evaluations and compare against a season-average baseline.

**Test:** Prove that the predicted week and future weeks are excluded from features.

**Exit:** Accuracy is reported by position and the selected model is justified against the baseline.

## Stage 12 — Rest-of-season analysis

**Build:** Optimize before and after lineups for each remaining week, including byes and playoff weeks.

**Test:** Weekly components, changing optimal lineups, past-week exclusion, and playoff separation.

**Exit:** Rest-of-season totals exactly equal displayed weekly sums.

## Stage 13 — Manual web experience

**Build:** Fixture-league selection, two-team trade builder, and analysis results page.

**Test:** Component states plus one browser-level happy path and invalid submission path.

**Exit:** A new user can analyze a demo trade without code or database access.

## Stage 14 — Sleeper integration

**Build:** Username lookup, league selection, settings, users, rosters, player mapping, caching, and refresh.

**Test:** Saved representative responses, invalid users, multiple leagues, unusual formats, timeout, rate limit, and roster changes.

**Exit:** At least three structurally different real leagues import and generate valid lineups.

## Stage 15 — Scarcity and depth

**Build:** Replacement value, positional need, bench coverage, and league-size-aware scarcity.

**Test:** Same player across different league sizes and roster constructions.

**Exit:** Team-specific value changes for explainable roster and league reasons.

## Stage 16 — Risk and fairness

**Build:** Separate volatility, availability, workload, depth, and raw fairness measures.

**Test:** Equal averages with different volatility; fair trades that hurt fit; unequal trades that help both teams.

**Exit:** Every verdict is reproducible from displayed components.

## Stage 17 — Results polish

**Build:** Responsive summary, before/after lineups, weekly comparison, depth, risk, fairness, methodology, and accessible states.

**Test:** Accessibility checks, responsive layouts, and usability sessions with fantasy players.

**Exit:** Users can identify who gains, who improves, and why.

## Stage 18 — Production hardening

**Build:** Validation, caching, timeouts, retry policy, rate limiting, indexing, logging, and dependency/security checks.

**Test:** Full automated suite, failure injection, performance targets, and external-source outage behavior.

**Exit:** Failures do not corrupt data and return actionable messages.

## Stage 19 — Deployment and Version 1

**Build:** Production hosting, managed database, migrations, scheduled data updates, monitoring, demo data, and release documentation.

**Test:** Clean-browser import and analysis, demo flow, persistence after refresh, mobile pass, and production smoke tests.

**Exit:** Public Version 1 meets every success criterion in `PRODUCT.md`.

## Post-Version 1 candidates

- ESPN adapter
- SUPERFLEX if not included at launch
- Dynasty picks
- Multi-team trades
- Saved and shareable analyses
- Waiver recommendations
- Championship simulations
- Optional generated explanations
