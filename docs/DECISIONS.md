# Decision Log

This file records durable product and architecture decisions. Update an existing entry only to correct factual mistakes; supersede changed decisions with a new entry.

## Accepted decisions

| ID    | Date       | Decision                                                                          | Reason                                                                                                                                |
| ----- | ---------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| D-001 | 2026-09-15 | Build a roster-aware trade analyzer rather than a universal value calculator.     | The differentiating value is measuring actual lineup and depth changes for both teams.                                                |
| D-002 | 2026-09-15 | Target Sleeper first.                                                             | Sleeper provides a documented read-only API for leagues, settings, rosters, and related data.                                         |
| D-003 | 2026-09-15 | Use nflverse as the initial historical NFL data source.                           | It provides structured analytical data without relying on brittle ESPN page scraping.                                                 |
| D-004 | 2026-09-15 | Postpone ESPN integration until after Version 1.                                  | ESPN would add undocumented or authentication-dependent behavior before the core engine is proven.                                    |
| D-005 | 2026-09-15 | Implement the analytical core before external integrations and polished UI.       | Controlled fixture data makes correctness easier to establish.                                                                        |
| D-006 | 2026-09-15 | Keep domain engines deterministic and independently testable.                     | Scoring and trade verdicts must be reproducible and explainable.                                                                      |
| D-007 | 2026-09-15 | Separate raw fairness from team-specific benefit.                                 | Equal exchanged value does not guarantee that a trade helps both roster constructions.                                                |
| D-008 | 2026-09-15 | Store raw football statistics and apply league scoring rules internally.          | Precomputed fantasy points cannot reliably represent different league settings.                                                       |
| D-009 | 2026-09-15 | Maintain internal player IDs with source-specific identifier mappings.            | Sleeper, nflverse, and future platforms use different identifiers.                                                                    |
| D-010 | 2026-09-15 | Use Next.js and TypeScript for the initial full-stack application.                | One typed application can support the interface, server routes, and shared domain contracts without premature service separation.     |
| D-011 | 2026-09-15 | Use PostgreSQL for persistent data.                                               | The project contains relational identities, league structures, statistics, projections, and constraints.                              |
| D-012 | 2026-09-15 | Do not use a generative model to calculate or override the trade score.           | The score must remain testable; a model may later explain structured results.                                                         |
| D-013 | 2026-09-15 | Use npm, Vitest, React Testing Library, and Playwright for the initial toolchain. | These tools provide a conventional dependency workflow plus focused unit, component, and browser testing for the Next.js application. |

## Pending decisions

| ID    | Question                                                          | Decision point                                     |
| ----- | ----------------------------------------------------------------- | -------------------------------------------------- |
| P-001 | Prisma or Drizzle ORM?                                            | Before Stage 7                                     |
| P-002 | Include kickers in Version 1?                                     | Before finalizing domain positions                 |
| P-003 | Include SUPERFLEX at launch?                                      | Before the lineup optimizer is considered complete |
| P-004 | Which managed PostgreSQL provider?                                | Before deployment                                  |
| P-005 | How is replacement level calculated?                              | Before scarcity implementation                     |
| P-006 | Are saved/shareable analyses part of Version 1?                   | Before UI persistence design                       |
| P-008 | How are fantasy playoff weeks determined for incomplete settings? | Before rest-of-season analysis                     |

## Decision template

Use this structure for additions:

```text
ID:
Date:
Status: proposed | accepted | superseded
Context:
Decision:
Consequences:
Supersedes:
```
