# ChaseBrown

A roster-aware fantasy football trade analyzer that evaluates how a proposed trade changes each team's best projected starting lineup, depth, risk, and rest-of-season outlook.

> Status: planning and documentation. Application code has not been started.

## Product goal

Most trade calculators compare players using universal values. ChaseBrown will evaluate trades in the context of a specific league and roster by answering:

- Who enters or leaves each starting lineup?
- How do projected weekly and rest-of-season points change?
- Does the trade improve positional depth or create a weakness?
- Is the exchanged value fair?
- Does the trade actually help both teams?

## Version 1 scope

The initial release targets Sleeper redraft leagues and common offensive roster formats. It will import league settings and rosters, let a user construct a trade, optimize both teams' lineups before and after the trade, and present a transparent numerical explanation.

Dynasty picks, ESPN integration, individual defensive players, payments, and generative-AI scoring are outside the initial scope.

## Documentation

- [Product definition](docs/PRODUCT.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Roadmap](docs/ROADMAP.md)
- [Data sources](docs/DATA_SOURCES.md)
- [Data model](docs/DATA_MODEL.md)
- [Test plan](docs/TEST_PLAN.md)
- [Decision log](docs/DECISIONS.md)
- [Current state](docs/CURRENT_STATE.md)
- [Agent instructions](AGENTS.md)

## Planned stack

- Next.js and TypeScript
- PostgreSQL
- Prisma or Drizzle ORM (decision pending)
- Tailwind CSS
- Sleeper API for league data
- nflverse for historical NFL data

## Core principle

The analytical engine must be deterministic and testable. Any future generative-AI feature may explain calculated results, but it must not create or override the trade score.

## Development status

See [docs/CURRENT_STATE.md](docs/CURRENT_STATE.md) for the current checkpoint and [docs/ROADMAP.md](docs/ROADMAP.md) for the ordered build plan.
