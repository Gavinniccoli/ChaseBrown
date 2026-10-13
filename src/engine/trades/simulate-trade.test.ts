import { describe, expect, it } from 'vitest';

import {
  DomainValidationError,
  type LeagueSnapshot,
  type TradeProposal,
} from '@/domain';
import { optimizeLineup } from '@/engine/lineup';
import { controlledLeague } from '@/test-fixtures/controlled-league';

import { simulateTrade } from './simulate-trade';

const oneForOneProposal: TradeProposal = {
  teamAId: 'team-alpha',
  teamBId: 'team-bravo',
  teamASends: ['alpha-rb-1'],
  teamBSends: ['bravo-wr-1'],
};

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const nestedValue of Object.values(value)) deepFreeze(nestedValue);
  }
  return value;
}

function shuffledSubset(
  values: readonly string[],
  count: number,
  random: () => number,
): string[] {
  const shuffled = [...values];

  for (let index = shuffled.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }

  return shuffled.slice(0, count);
}

describe('simulateTrade', () => {
  it('applies a one-for-one trade to exact copied rosters', () => {
    const result = simulateTrade(controlledLeague, oneForOneProposal);

    expect(result).toEqual({
      proposal: oneForOneProposal,
      teamARoster: {
        teamId: 'team-alpha',
        playerIds: [
          'alpha-qb-1',
          'alpha-qb-2',
          'alpha-rb-2',
          'alpha-rb-3',
          'alpha-wr-1',
          'alpha-wr-2',
          'alpha-wr-3',
          'alpha-te-1',
          'alpha-te-2',
          'alpha-k-1',
          'alpha-dst-1',
          'bravo-wr-1',
        ],
      },
      teamBRoster: {
        teamId: 'team-bravo',
        playerIds: [
          'bravo-qb-1',
          'bravo-qb-2',
          'bravo-rb-1',
          'bravo-rb-2',
          'bravo-rb-3',
          'bravo-wr-2',
          'bravo-wr-3',
          'bravo-te-1',
          'bravo-te-2',
          'bravo-k-1',
          'bravo-dst-1',
          'alpha-rb-1',
        ],
      },
    });
    expect(result.teamARoster).not.toBe(controlledLeague.rosters[0]);
    expect(result.teamBRoster).not.toBe(controlledLeague.rosters[1]);
    expect(result.teamARoster.playerIds).not.toBe(
      controlledLeague.rosters[0].playerIds,
    );
    expect(result.teamBRoster.playerIds).not.toBe(
      controlledLeague.rosters[1].playerIds,
    );
  });

  it('supports a two-for-one trade and preserves retained-player order', () => {
    const result = simulateTrade(controlledLeague, {
      ...oneForOneProposal,
      teamASends: ['alpha-rb-1', 'alpha-wr-3'],
    });

    expect(result.teamARoster.playerIds).toHaveLength(11);
    expect(result.teamBRoster.playerIds).toHaveLength(13);
    expect(result.teamARoster.playerIds.slice(-1)).toEqual(['bravo-wr-1']);
    expect(result.teamBRoster.playerIds.slice(-2)).toEqual([
      'alpha-rb-1',
      'alpha-wr-3',
    ]);
    expect(result.teamARoster.playerIds).not.toContain('alpha-rb-1');
    expect(result.teamARoster.playerIds).not.toContain('alpha-wr-3');
  });

  it('supports a three-for-two trade', () => {
    const result = simulateTrade(controlledLeague, {
      ...oneForOneProposal,
      teamASends: ['alpha-rb-1', 'alpha-rb-2', 'alpha-wr-3'],
      teamBSends: ['bravo-wr-1', 'bravo-te-1'],
    });

    expect(result.teamARoster.playerIds).toHaveLength(11);
    expect(result.teamBRoster.playerIds).toHaveLength(13);
    expect(result.teamARoster.playerIds.slice(-2)).toEqual([
      'bravo-wr-1',
      'bravo-te-1',
    ]);
    expect(result.teamBRoster.playerIds.slice(-3)).toEqual([
      'alpha-rb-1',
      'alpha-rb-2',
      'alpha-wr-3',
    ]);
  });

  it('treats either participating team correctly as team A', () => {
    const result = simulateTrade(controlledLeague, {
      teamAId: 'team-bravo',
      teamBId: 'team-alpha',
      teamASends: ['bravo-te-1'],
      teamBSends: ['alpha-wr-1'],
    });

    expect(result.teamARoster.teamId).toBe('team-bravo');
    expect(result.teamARoster.playerIds).toContain('alpha-wr-1');
    expect(result.teamARoster.playerIds).not.toContain('bravo-te-1');
    expect(result.teamBRoster.teamId).toBe('team-alpha');
    expect(result.teamBRoster.playerIds).toContain('bravo-te-1');
    expect(result.teamBRoster.playerIds).not.toContain('alpha-wr-1');
  });

  it('normalizes trimmed proposal identifiers before applying the trade', () => {
    const result = simulateTrade(controlledLeague, {
      teamAId: ' team-alpha ',
      teamBId: ' team-bravo ',
      teamASends: [' alpha-rb-1 '],
      teamBSends: [' bravo-wr-1 '],
    });

    expect(result.proposal).toEqual(oneForOneProposal);
    expect(result.teamARoster.playerIds).toContain('bravo-wr-1');
    expect(result.teamBRoster.playerIds).toContain('alpha-rb-1');
  });

  it('does not mutate deeply frozen source rosters or the proposal', () => {
    const snapshot = deepFreeze(
      structuredClone(controlledLeague) as LeagueSnapshot,
    );
    const proposal = deepFreeze(structuredClone(oneForOneProposal));
    const snapshotBefore = structuredClone(snapshot);
    const proposalBefore = structuredClone(proposal);

    expect(() => simulateTrade(snapshot, proposal)).not.toThrow();
    expect(snapshot).toEqual(snapshotBefore);
    expect(proposal).toEqual(proposalBefore);
  });

  it('keeps repeated simulations independent from one another', () => {
    const first = simulateTrade(controlledLeague, oneForOneProposal);
    const second = simulateTrade(controlledLeague, {
      ...oneForOneProposal,
      teamASends: ['alpha-te-1'],
      teamBSends: ['bravo-rb-1'],
    });

    expect(first.teamARoster.playerIds).toContain('bravo-wr-1');
    expect(first.teamARoster.playerIds).not.toContain('bravo-rb-1');
    expect(second.teamARoster.playerIds).toContain('bravo-rb-1');
    expect(second.teamARoster.playerIds).not.toContain('bravo-wr-1');
    expect(controlledLeague.rosters[0].playerIds).toContain('alpha-rb-1');
    expect(controlledLeague.rosters[1].playerIds).toContain('bravo-wr-1');
  });

  it('allows a legal trade to create an unfilled starting position', () => {
    const result = simulateTrade(controlledLeague, {
      ...oneForOneProposal,
      teamASends: ['alpha-k-1'],
      teamBSends: ['bravo-wr-3'],
    });
    const lineup = optimizeLineup({
      roster: result.teamARoster,
      lineupRules: controlledLeague.league.lineupRules,
      players: controlledLeague.players,
      projections: controlledLeague.projections,
    });

    expect(result.teamARoster.playerIds).not.toContain('alpha-k-1');
    expect(lineup.unfilledSlots).toEqual(['K']);
    expect(
      lineup.assignments.some((assignment) => assignment.slot === 'K'),
    ).toBe(false);
  });

  it.each([
    {
      name: 'an unknown team',
      proposal: { ...oneForOneProposal, teamAId: 'missing-team' },
      message: 'trade references unknown team missing-team',
    },
    {
      name: 'the same team on both sides',
      proposal: {
        ...oneForOneProposal,
        teamBId: 'team-alpha',
        teamBSends: ['alpha-wr-1'],
      },
      message: 'trade teams must be different',
    },
    {
      name: 'an empty team A side',
      proposal: { ...oneForOneProposal, teamASends: [] },
      message: 'team A must send at least one player',
    },
    {
      name: 'an empty team B side',
      proposal: { ...oneForOneProposal, teamBSends: [] },
      message: 'team B must send at least one player',
    },
    {
      name: 'a nonexistent player',
      proposal: { ...oneForOneProposal, teamASends: ['missing-player'] },
      message: 'trade references unknown player missing-player',
    },
    {
      name: 'a player sent by the wrong team',
      proposal: { ...oneForOneProposal, teamASends: ['bravo-rb-1'] },
      message: 'player bravo-rb-1 is not owned by team team-alpha',
    },
    {
      name: 'a duplicated player on one side',
      proposal: {
        ...oneForOneProposal,
        teamASends: ['alpha-rb-1', 'alpha-rb-1'],
      },
      message: 'duplicate team A outgoing player: alpha-rb-1',
    },
    {
      name: 'the same player on both sides',
      proposal: {
        ...oneForOneProposal,
        teamBSends: ['alpha-rb-1'],
      },
      message: 'duplicate outgoing player across trade: alpha-rb-1',
    },
  ])('rejects $name', ({ proposal, message }) => {
    expect(() => simulateTrade(controlledLeague, proposal)).toThrow(
      DomainValidationError,
    );
    expect(() => simulateTrade(controlledLeague, proposal)).toThrow(message);
  });

  it('preserves ownership and player conservation across generated uneven trades', () => {
    let state = 0x7ade5005;
    const random = () => {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      return state / 0x100000000;
    };
    const teamAOriginal = controlledLeague.rosters[0].playerIds;
    const teamBOriginal = controlledLeague.rosters[1].playerIds;
    const allOriginalPlayers = new Set([...teamAOriginal, ...teamBOriginal]);

    for (let caseIndex = 0; caseIndex < 500; caseIndex++) {
      const teamASends = shuffledSubset(
        teamAOriginal,
        Math.floor(random() * 5) + 1,
        random,
      );
      const teamBSends = shuffledSubset(
        teamBOriginal,
        Math.floor(random() * 5) + 1,
        random,
      );
      const result = simulateTrade(controlledLeague, {
        teamAId: 'team-alpha',
        teamBId: 'team-bravo',
        teamASends,
        teamBSends,
      });
      const allResultPlayers = [
        ...result.teamARoster.playerIds,
        ...result.teamBRoster.playerIds,
      ];

      expect(new Set(allResultPlayers)).toEqual(allOriginalPlayers);
      expect(allResultPlayers).toHaveLength(allOriginalPlayers.size);
      expect(result.teamARoster.playerIds).toHaveLength(
        teamAOriginal.length - teamASends.length + teamBSends.length,
      );
      expect(result.teamBRoster.playerIds).toHaveLength(
        teamBOriginal.length - teamBSends.length + teamASends.length,
      );
      expect(result.teamARoster.playerIds.slice(-teamBSends.length)).toEqual(
        teamBSends,
      );
      expect(result.teamBRoster.playerIds.slice(-teamASends.length)).toEqual(
        teamASends,
      );
      expect(
        teamASends.every((playerId) =>
          result.teamBRoster.playerIds.includes(playerId),
        ),
      ).toBe(true);
      expect(
        teamBSends.every((playerId) =>
          result.teamARoster.playerIds.includes(playerId),
        ),
      ).toBe(true);
    }
  });
});
