import {
  DomainValidationError,
  validateTradeProposal,
  type FantasyRoster,
  type LeagueSnapshot,
  type TradeProposal,
} from '@/domain';

export type TradeSimulationResult = Readonly<{
  proposal: TradeProposal;
  teamARoster: FantasyRoster;
  teamBRoster: FantasyRoster;
}>;

function requireRoster(
  snapshot: LeagueSnapshot,
  teamId: string,
): FantasyRoster {
  const roster = snapshot.rosters.find(
    (candidate) => candidate.teamId === teamId,
  );

  if (roster === undefined) {
    throw new DomainValidationError([`team ${teamId} does not have a roster`]);
  }

  return roster;
}

function transferPlayers(
  roster: FantasyRoster,
  outgoingPlayerIds: readonly string[],
  incomingPlayerIds: readonly string[],
): FantasyRoster {
  const outgoing = new Set(outgoingPlayerIds);

  return {
    teamId: roster.teamId,
    playerIds: [
      ...roster.playerIds.filter((playerId) => !outgoing.has(playerId)),
      ...incomingPlayerIds,
    ],
  };
}

export function simulateTrade(
  snapshot: LeagueSnapshot,
  proposalInput: unknown,
): TradeSimulationResult {
  const proposal = validateTradeProposal(proposalInput, snapshot);
  const originalTeamARoster = requireRoster(snapshot, proposal.teamAId);
  const originalTeamBRoster = requireRoster(snapshot, proposal.teamBId);

  return {
    proposal,
    teamARoster: transferPlayers(
      originalTeamARoster,
      proposal.teamASends,
      proposal.teamBSends,
    ),
    teamBRoster: transferPlayers(
      originalTeamBRoster,
      proposal.teamBSends,
      proposal.teamASends,
    ),
  };
}
