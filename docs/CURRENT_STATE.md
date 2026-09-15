# Current State

## Checkpoint

**Date:** 2026-09-15

**Overall status:** Documentation initialized; application implementation has not started.

## Completed

- Repository created and initialized.
- Product goal documented.
- Version 1 scope and exclusions documented.
- Initial architecture and component boundaries documented.
- Ordered implementation roadmap and quality gates documented.
- Initial data-source policy documented.
- Conceptual data model documented.
- Test strategy documented.
- Durable and pending decisions recorded.
- AI-agent working rules established.

## In progress

- Stage 0: product foundation review.

## Not started

- Application scaffold
- Domain types and fixture league
- Scoring engine
- Lineup optimizer
- Trade simulator
- Database
- Data ingestion
- Projection and backtesting system
- Sleeper integration
- User interface
- Deployment

## Next recommended action

Review the pending decisions that affect Stage 1, then scaffold the Next.js and TypeScript project with a complete local and CI quality baseline.

Minimum Stage 1 choices:

1. Package manager
2. Test runner
3. End-to-end testing tool
4. Initial decision on kicker and SUPERFLEX type support

## Current risks

- External source schemas and licensing conditions can change.
- Player identity mapping across sources may require manual review.
- Projection quality can be overstated without leakage-safe backtesting.
- Flexible roster positions can make naive lineup algorithms incorrect.
- The product can become over-scoped if dynasty, ESPN, or recommendation features enter before the core engine is proven.

## Known open questions

See `docs/DECISIONS.md` for the authoritative pending-decision list.

## Verification performed

- Documentation paths and cross-references were reviewed for consistency.
- Sleeper's current documentation was checked for read-only access, non-commercial terms, authentication behavior, and general request guidance.
- nflverse was confirmed as the planned historical-data source; exact datasets and columns remain intentionally undecided until real-data inspection.
- No code, build, lint, or automated tests exist yet.
