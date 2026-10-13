import { describe, expect, it } from 'vitest';

import { controlledLeague } from '@/test-fixtures/controlled-league';

import { validateLeagueSnapshot, validateTradeProposal } from './validation';

describe('league snapshot validation', () => {
  it('accepts the controlled league', () => {
    expect(validateLeagueSnapshot(controlledLeague)).toEqual(controlledLeague);
  });

  it('rejects an invalid player position', () => {
    const invalidSnapshot = {
      ...controlledLeague,
      players: [
        { ...controlledLeague.players[0], position: 'SUPERFLEX' },
        ...controlledLeague.players.slice(1),
      ],
    };

    expect(() => validateLeagueSnapshot(invalidSnapshot)).toThrow(
      /Invalid option/,
    );
  });

  it('rejects an invalid lineup slot', () => {
    const invalidSnapshot = {
      ...controlledLeague,
      league: {
        ...controlledLeague.league,
        lineupRules: [{ slot: 'BENCH', quantity: 1 }],
      },
    };

    expect(() => validateLeagueSnapshot(invalidSnapshot)).toThrow(
      /Invalid option/,
    );
  });

  it('rejects duplicate player IDs', () => {
    const invalidSnapshot = {
      ...controlledLeague,
      players: [...controlledLeague.players, controlledLeague.players[0]],
    };

    expect(() => validateLeagueSnapshot(invalidSnapshot)).toThrow(
      /duplicate player id: alpha-qb-1/,
    );
  });

  it('rejects an unknown roster player', () => {
    const invalidSnapshot = {
      ...controlledLeague,
      rosters: [
        {
          ...controlledLeague.rosters[0],
          playerIds: [
            ...controlledLeague.rosters[0].playerIds,
            'missing-player',
          ],
        },
        controlledLeague.rosters[1],
      ],
    };

    expect(() => validateLeagueSnapshot(invalidSnapshot)).toThrow(
      /references unknown player missing-player/,
    );
  });

  it('rejects a player assigned to two teams', () => {
    const invalidSnapshot = {
      ...controlledLeague,
      rosters: [
        controlledLeague.rosters[0],
        {
          ...controlledLeague.rosters[1],
          playerIds: [...controlledLeague.rosters[1].playerIds, 'alpha-rb-1'],
        },
      ],
    };

    expect(() => validateLeagueSnapshot(invalidSnapshot)).toThrow(
      /player alpha-rb-1 appears on multiple rosters/,
    );
  });

  it('rejects duplicate projection natural keys', () => {
    const invalidSnapshot = {
      ...controlledLeague,
      projections: [
        ...controlledLeague.projections,
        controlledLeague.projections[0],
      ],
    };

    expect(() => validateLeagueSnapshot(invalidSnapshot)).toThrow(
      /duplicate projection key: alpha-qb-1:2026:8:controlled-fixture-v1/,
    );
  });

  it('rejects invalid projection ranges', () => {
    const invalidSnapshot = {
      ...controlledLeague,
      projections: [
        { ...controlledLeague.projections[0], lowPoints: 30 },
        ...controlledLeague.projections.slice(1),
      ],
    };

    expect(() => validateLeagueSnapshot(invalidSnapshot)).toThrow(
      /lowPoints must be less than or equal to expectedPoints/,
    );
  });
});

describe('trade proposal validation', () => {
  const validProposal = {
    teamAId: 'team-alpha',
    teamBId: 'team-bravo',
    teamASends: ['alpha-rb-1'],
    teamBSends: ['bravo-wr-1'],
  };

  it('accepts a trade between players owned by different teams', () => {
    expect(validateTradeProposal(validProposal, controlledLeague)).toEqual(
      validProposal,
    );
  });

  it('rejects an unknown team reference', () => {
    expect(() =>
      validateTradeProposal(
        { ...validProposal, teamBId: 'missing-team' },
        controlledLeague,
      ),
    ).toThrow(/trade references unknown team missing-team/);
  });

  it('rejects a trade with the same team on both sides', () => {
    expect(() =>
      validateTradeProposal(
        {
          ...validProposal,
          teamBId: 'team-alpha',
          teamBSends: ['alpha-wr-1'],
        },
        controlledLeague,
      ),
    ).toThrow(/trade teams must be different/);
  });

  it('rejects an empty side of a trade', () => {
    expect(() =>
      validateTradeProposal(
        { ...validProposal, teamASends: [] },
        controlledLeague,
      ),
    ).toThrow(/team A must send at least one player/);
  });

  it('rejects a player that does not exist in the league snapshot', () => {
    expect(() =>
      validateTradeProposal(
        { ...validProposal, teamASends: ['missing-player'] },
        controlledLeague,
      ),
    ).toThrow(/trade references unknown player missing-player/);
  });

  it('rejects a player sent by a team that does not own them', () => {
    expect(() =>
      validateTradeProposal(
        { ...validProposal, teamASends: ['bravo-wr-1'] },
        controlledLeague,
      ),
    ).toThrow(/player bravo-wr-1 is not owned by team team-alpha/);
  });

  it('rejects a duplicated player across both sides', () => {
    expect(() =>
      validateTradeProposal(
        {
          ...validProposal,
          teamASends: ['alpha-rb-1'],
          teamBSends: ['alpha-rb-1'],
        },
        controlledLeague,
      ),
    ).toThrow(/duplicate outgoing player across trade: alpha-rb-1/);
  });
});
