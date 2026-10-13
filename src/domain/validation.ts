import { z } from 'zod';

import {
  fantasyLeagueSchema,
  fantasyRosterSchema,
  fantasyTeamSchema,
  type LeagueSnapshot,
} from './leagues';
import { playerSchema, weeklyStatsSchema } from './players';
import { weeklyProjectionSchema } from './projections';
import { tradeProposalSchema, type TradeProposal } from './trades';

const leagueSnapshotStructureSchema = z.object({
  league: fantasyLeagueSchema,
  players: z.array(playerSchema),
  teams: z.array(fantasyTeamSchema),
  rosters: z.array(fantasyRosterSchema),
  projections: z.array(weeklyProjectionSchema),
  stats: z.array(weeklyStatsSchema).optional(),
});

export class DomainValidationError extends Error {
  readonly issues: readonly string[];

  constructor(issues: readonly string[]) {
    super(`Domain validation failed: ${issues.join('; ')}`);
    this.name = 'DomainValidationError';
    this.issues = issues;
  }
}

function formatZodIssues(error: z.ZodError): string[] {
  return error.issues.map((issue) => {
    const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : '';
    return `${path}${issue.message}`;
  });
}

function findDuplicates(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const value of values) {
    if (seen.has(value)) {
      duplicates.add(value);
    }
    seen.add(value);
  }

  return [...duplicates];
}

function addDuplicateIssues(
  issues: string[],
  label: string,
  values: readonly string[],
): void {
  for (const duplicate of findDuplicates(values)) {
    issues.push(`duplicate ${label}: ${duplicate}`);
  }
}

export function validateLeagueSnapshot(input: unknown): LeagueSnapshot {
  const structuralResult = leagueSnapshotStructureSchema.safeParse(input);

  if (!structuralResult.success) {
    throw new DomainValidationError(formatZodIssues(structuralResult.error));
  }

  const snapshot = structuralResult.data;
  const issues: string[] = [];
  const playerIds = new Set(snapshot.players.map((player) => player.id));
  const teamIds = new Set(snapshot.teams.map((team) => team.id));

  addDuplicateIssues(
    issues,
    'player id',
    snapshot.players.map((player) => player.id),
  );
  addDuplicateIssues(
    issues,
    'team id',
    snapshot.teams.map((team) => team.id),
  );
  addDuplicateIssues(
    issues,
    'roster team id',
    snapshot.rosters.map((roster) => roster.teamId),
  );
  addDuplicateIssues(
    issues,
    'lineup slot rule',
    snapshot.league.lineupRules.map((rule) => rule.slot),
  );

  const projectionKeys = snapshot.projections.map(
    (projection) =>
      `${projection.playerId}:${projection.season}:${projection.week}:${projection.modelVersion}`,
  );
  addDuplicateIssues(issues, 'projection key', projectionKeys);

  const statsKeys = (snapshot.stats ?? []).map(
    (stats) => `${stats.playerId}:${stats.season}:${stats.week}`,
  );
  addDuplicateIssues(issues, 'weekly stats key', statsKeys);

  for (const team of snapshot.teams) {
    if (team.leagueId !== snapshot.league.id) {
      issues.push(`team ${team.id} references unknown league ${team.leagueId}`);
    }
  }

  const rosterOwnerByPlayerId = new Map<string, string>();
  for (const roster of snapshot.rosters) {
    if (!teamIds.has(roster.teamId)) {
      issues.push(`roster references unknown team ${roster.teamId}`);
    }

    addDuplicateIssues(
      issues,
      `player id on roster ${roster.teamId}`,
      roster.playerIds,
    );

    for (const playerId of roster.playerIds) {
      if (!playerIds.has(playerId)) {
        issues.push(
          `roster ${roster.teamId} references unknown player ${playerId}`,
        );
      }
      const existingOwner = rosterOwnerByPlayerId.get(playerId);
      if (existingOwner !== undefined && existingOwner !== roster.teamId) {
        issues.push(`player ${playerId} appears on multiple rosters`);
      }
      rosterOwnerByPlayerId.set(playerId, roster.teamId);
    }
  }

  for (const teamId of teamIds) {
    if (!snapshot.rosters.some((roster) => roster.teamId === teamId)) {
      issues.push(`team ${teamId} does not have a roster`);
    }
  }

  for (const projection of snapshot.projections) {
    if (!playerIds.has(projection.playerId)) {
      issues.push(
        `projection references unknown player ${projection.playerId}`,
      );
    }
    if (projection.season !== snapshot.league.season) {
      issues.push(
        `projection for ${projection.playerId} uses season ${projection.season} instead of ${snapshot.league.season}`,
      );
    }
  }

  for (const stats of snapshot.stats ?? []) {
    if (!playerIds.has(stats.playerId)) {
      issues.push(`weekly stats reference unknown player ${stats.playerId}`);
    }
    if (stats.season !== snapshot.league.season) {
      issues.push(
        `weekly stats for ${stats.playerId} use season ${stats.season} instead of ${snapshot.league.season}`,
      );
    }
  }

  if (issues.length > 0) {
    throw new DomainValidationError(issues);
  }

  return snapshot as LeagueSnapshot;
}

export function validateTradeProposal(
  input: unknown,
  snapshot: LeagueSnapshot,
): TradeProposal {
  const structuralResult = tradeProposalSchema.safeParse(input);

  if (!structuralResult.success) {
    throw new DomainValidationError(formatZodIssues(structuralResult.error));
  }

  const proposal = structuralResult.data;
  const issues: string[] = [];
  const teamIds = new Set(snapshot.teams.map((team) => team.id));
  const playerIds = new Set(snapshot.players.map((player) => player.id));

  if (!teamIds.has(proposal.teamAId)) {
    issues.push(`trade references unknown team ${proposal.teamAId}`);
  }
  if (!teamIds.has(proposal.teamBId)) {
    issues.push(`trade references unknown team ${proposal.teamBId}`);
  }
  if (proposal.teamAId === proposal.teamBId) {
    issues.push('trade teams must be different');
  }

  addDuplicateIssues(issues, 'team A outgoing player', proposal.teamASends);
  addDuplicateIssues(issues, 'team B outgoing player', proposal.teamBSends);

  const allOutgoingPlayers = [...proposal.teamASends, ...proposal.teamBSends];
  addDuplicateIssues(
    issues,
    'outgoing player across trade',
    allOutgoingPlayers,
  );

  const teamARoster = snapshot.rosters.find(
    (roster) => roster.teamId === proposal.teamAId,
  );
  const teamBRoster = snapshot.rosters.find(
    (roster) => roster.teamId === proposal.teamBId,
  );
  const teamAPlayerIds = new Set(teamARoster?.playerIds ?? []);
  const teamBPlayerIds = new Set(teamBRoster?.playerIds ?? []);

  for (const playerId of proposal.teamASends) {
    if (!playerIds.has(playerId)) {
      issues.push(`trade references unknown player ${playerId}`);
    } else if (!teamAPlayerIds.has(playerId)) {
      issues.push(
        `player ${playerId} is not owned by team ${proposal.teamAId}`,
      );
    }
  }

  for (const playerId of proposal.teamBSends) {
    if (!playerIds.has(playerId)) {
      issues.push(`trade references unknown player ${playerId}`);
    } else if (!teamBPlayerIds.has(playerId)) {
      issues.push(
        `player ${playerId} is not owned by team ${proposal.teamBId}`,
      );
    }
  }

  if (issues.length > 0) {
    throw new DomainValidationError(issues);
  }

  return proposal as TradeProposal;
}
