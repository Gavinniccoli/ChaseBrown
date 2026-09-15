# Test Plan

## Goal

Testing must establish that trade results are mathematically correct, league-valid, reproducible, and resilient to bad external data.

## Test layers

### Unit tests

Use for pure domain behavior:

- Fantasy-point calculation
- Position and slot eligibility
- Lineup optimization
- Trade validation and simulation
- Replacement value and scarcity
- Risk and fairness component calculations
- Projection feature calculations

These tests run on every relevant change.

### Property and reference tests

For the lineup optimizer:

- Maintain a simple brute-force reference implementation for small rosters.
- Generate many valid small rosters and slot combinations.
- Require the production optimizer to match the reference total and validity.
- Check that no player appears twice and every assignment is eligible.

### Integration tests

Use a disposable database and saved source fixtures to test:

- Migrations from an empty database
- Constraints and relationships
- Idempotent imports
- Repository queries
- Sleeper normalization
- nflverse normalization
- Player identity resolution
- Transactional failure behavior

### Data-quality tests

Every import checks:

- Required columns or fields
- Expected types
- Valid season and week ranges
- Duplicate natural keys
- Impossible or suspicious values
- Inserted, updated, rejected, and unmatched counts
- Drift from prior expected schemas

### Projection backtests

- Use time-ordered splits.
- Make only data available before the predicted week accessible to the model.
- Compare against a simple season-average baseline.
- Report mean absolute error, root mean squared error, and ranking accuracy.
- Break down results by position and sample size.
- Retain model version and evaluated data window.

### Component tests

Cover:

- Team and player selection
- Adding and removing trade pieces
- Validation messages
- Loading, empty, unsupported, and error states
- Analysis rendering from a fixed result

### End-to-end tests

Required journeys:

1. Analyze a trade in the demo league.
2. Import a representative Sleeper league and analyze a trade.
3. Reject an invalid or empty trade.
4. Recover gracefully from an external-source failure.

### Nonfunctional tests

- Keyboard navigation and accessible names
- Color contrast and screen-size behavior
- Import and analysis response time
- External API timeout behavior
- Rate limiting
- Dependency and secret scanning
- Production smoke tests

## Stage quality gates

| Stage               | Required gate                                                                   |
| ------------------- | ------------------------------------------------------------------------------- |
| Repository setup    | Format, lint, type check, unit test, and production build pass                  |
| Scoring             | Hand-calculated formats and edge cases pass                                     |
| Optimizer           | Fixture, property, and brute-force comparison pass                              |
| Trade simulator     | Legal and invalid trade cases pass; original rosters remain unchanged           |
| Database            | Fresh migration and seed pass                                                   |
| Data ingestion      | Repeated import produces no duplicates                                          |
| Projections         | No leakage; selected model justified against baseline                           |
| Sleeper integration | Saved-fixture tests plus three representative real leagues                      |
| UI                  | Component suite and core browser flow pass                                      |
| Release             | Full suite, accessibility, performance, mobile, and production smoke tests pass |

## Test fixtures

- Keep fixtures small, readable, sanitized, and versioned.
- Include both ordinary and unusual league configurations.
- Record the source retrieval date and purpose.
- Never store credentials, private cookies, or unnecessary personal data.
- Prefer fixed fixtures for CI; use live calls only for explicit contract/smoke checks.

## Defect policy

A known defect affecting scoring, lineup validity, roster ownership, projection leakage, or data integrity blocks release. Cosmetic issues may be recorded and deferred if they do not prevent understanding or accessibility.

## Commands

The Stage 1 quality commands are:

```text
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
npm run check
```

`npm run check` runs formatting, linting, type checking, unit tests, and the production build. Playwright runs separately because it starts the application and requires an installed browser. CI runs both groups on pushes to `main` and on every pull request.
