# Data Sources

## Policy

External data must enter the application through a validated adapter. Store source identifiers and retrieval metadata, preserve raw inputs when useful for debugging, and never let source response objects become domain objects.

Licensing and access conditions can change. Re-check source terms before commercial use or a major release.

## Approved initial sources

| Source | Purpose | Access | Initial refresh | Notes |
|---|---|---|---|---|
| [Sleeper API](https://docs.sleeper.com/) | League settings, users, rosters, matchups, transactions, player IDs | Documented read-only HTTP API; no token for documented endpoints | On import and user-requested refresh, with caching | Sleeper states that non-commercial use is free, commercial use requires contact, and clients should generally remain below 1,000 calls/minute |
| [nflverse](https://nflverse.nflverse.com/) | Historical NFL player statistics and related analytical datasets | Published data files and open-source tooling | After games or source releases; completed seasons become effectively static | Verify the license of each selected dataset/package and record its version |

## Sleeper integration

### Planned data

- User lookup
- User leagues by season
- League settings and scoring settings
- Roster positions
- League users and team display information
- Rosters and starters
- Weekly matchups when needed
- Transactions only when a product feature requires them
- Sleeper player identifiers

### Boundary rules

- Store stable `user_id` rather than treating a changeable username as identity.
- Cache player metadata rather than downloading the full player set per request.
- Validate every response before normalization.
- Do not collect Sleeper passwords or authentication cookies.
- Handle unavailable, malformed, and rate-limited responses explicitly.
- Keep representative sanitized responses as test fixtures.

## nflverse integration

### Planned data

- Player identity fields
- Season and week
- Passing production and opportunity
- Rushing production and opportunity
- Receiving production and opportunity
- Fumbles
- Team and opponent context
- Schedule or bye information when provided by the selected dataset

Exact files and columns will be recorded after Stage 8 inspects real data. Columns must not be designed from memory.

### Boundary rules

- Pin or record source versions and retrieval dates.
- Validate required columns before importing rows.
- Preserve raw football statistics rather than only calculated fantasy points.
- Use an upsert key equivalent to player, season, week, and season type.
- Produce a report for rejected records and unmatched players.
- Make imports idempotent.

## Player identity mapping

One internal player may have several source identifiers:

```text
internal player ID
  -> Sleeper player ID
  -> nflverse/GSIS ID
  -> future ESPN ID
```

Prefer stable source identifiers. Names, teams, and positions may assist review but must not silently resolve an ambiguous player.

## Derived data

The application will calculate and version:

- Fantasy points under each league's scoring settings
- Weekly expected, low, and high projections
- Positional replacement levels
- Lineup and rest-of-season impacts
- Risk, depth, scarcity, and fairness components

Derived values must record the model or algorithm version and generation time.

## Future or unapproved sources

### ESPN

ESPN integration is postponed. Do not build against scraped pages or undocumented endpoints during Version 1. Any future adapter requires a fresh review of access, authentication, stability, and licensing.

### Commercial projections, news, or injury feeds

No provider has been selected. Before adding one, document its cost, license, redistribution rules, rate limits, update latency, identifiers, and outage behavior.

## Data provenance checklist

For every added source, record:

- Official URL
- Dataset or endpoint name
- Intended fields
- License or permitted use
- Authentication method
- Rate limits
- Refresh schedule
- Cache policy
- Version and retrieval timestamp
- Failure behavior
- Identity-matching strategy
