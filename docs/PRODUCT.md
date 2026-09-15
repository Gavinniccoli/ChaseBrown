# Product Definition

## Product statement

ChaseBrown is a roster-aware fantasy football trade analyzer. It evaluates how a proposed trade changes each team's best projected lineup, depth, risk, and rest-of-season outlook within the rules of a specific league.

## Problem

Most trade calculators assign universal values to players. They do not adequately account for roster construction. A receiver can be extremely valuable to a team starting a weak flex player and much less useful to a team where the receiver would remain on the bench.

ChaseBrown will separate two questions:

1. Is the exchanged value reasonably fair?
2. Does the trade actually improve each team?

## Target user

The initial user is a manager in a Sleeper redraft fantasy football league who wants to evaluate a proposed two-team trade.

## Version 1 user flow

1. Enter a Sleeper username.
2. Select one of the user's leagues.
3. Import league settings, teams, and rosters.
4. Select two fantasy teams.
5. Select the players each team would send.
6. Simulate both rosters before and after the trade.
7. Optimize the best valid lineup for each remaining week.
8. Display the effect on both teams with a transparent explanation.

## Version 1 outputs

- Current-week projected lineup change for each team
- Rest-of-season projected lineup change
- Players entering and leaving each starting lineup
- Bye-week and playoff-week effects
- Positional depth and replacement-value changes
- Projection uncertainty or risk indicators
- Raw trade-fairness comparison
- A verdict derived from displayed numerical components

## Included in Version 1

- Sleeper league import
- Redraft leagues
- Common offensive roster positions
- Team defense where supported by the data
- Standard, half-PPR, full-PPR, and compatible custom scoring
- One-for-one and multi-player, two-team trades
- Manual demonstration league
- Deterministic trade analysis
- Responsive web interface

## Explicitly excluded from Version 1

- ESPN and Yahoo integrations
- Dynasty draft-pick valuation
- Multi-team trades
- Individual defensive player leagues
- Automated trade offers or messages
- Payments and subscriptions
- Native mobile applications
- User accounts beyond what is required to import a public/read-only league
- A generative model calculating player projections or trade scores

## Product principles

- Roster impact matters more than universal player value.
- Every verdict must be explainable from visible calculations.
- League settings must affect scoring, scarcity, and lineup construction.
- Uncertainty must be shown rather than hidden.
- Unsupported formats must fail clearly rather than produce misleading results.

## Version 1 success criteria

- A new user can import a supported Sleeper league and analyze a trade without setup instructions.
- The optimizer always returns a valid highest-projected lineup for supported positions.
- The displayed rest-of-season total equals the sum of its weekly components.
- Re-importing the same source data does not create duplicates.
- Every verdict identifies the concrete lineup and depth changes that caused it.
- A demo flow works without requiring a Sleeper account.

## Open product questions

- Whether kickers are included in the first release
- Whether SUPERFLEX is required for launch or added immediately afterward
- How replacement level is defined for free agents versus an abstract positional baseline
- Whether saved/shareable analyses belong in Version 1 or the next release
- Which weeks count as fantasy playoffs when league settings do not specify them clearly
