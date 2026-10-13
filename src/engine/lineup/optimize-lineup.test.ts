import { describe, expect, it } from 'vitest';

import {
  isPlayerEligibleForSlot,
  type LineupRule,
  type OptimizedLineup,
  type Player,
  type PlayerPosition,
  type WeeklyProjection,
} from '@/domain';
import { controlledLeague } from '@/test-fixtures/controlled-league';

import { bruteForceLineupReference } from './brute-force-reference';
import {
  LineupOptimizationError,
  optimizeLineup,
  type LineupOptimizationInput,
} from './optimize-lineup';

function player(id: string, position: PlayerPosition): Player {
  return { id, displayName: id, position, nflTeam: null };
}

function projection(
  playerId: string,
  expectedPoints: number,
  availability: WeeklyProjection['availability'] = 'ACTIVE',
): WeeklyProjection {
  return {
    playerId,
    season: 2026,
    week: 1,
    expectedPoints,
    lowPoints: expectedPoints - 1,
    highPoints: expectedPoints + 1,
    availability,
    modelVersion: 'lineup-test',
    generatedAt: '2026-10-13T00:00:00.000Z',
  };
}

function input(
  players: readonly Player[],
  lineupRules: readonly LineupRule[],
  projections: readonly WeeklyProjection[] = [],
): LineupOptimizationInput {
  return {
    roster: { teamId: 'test-team', playerIds: players.map(({ id }) => id) },
    lineupRules,
    players,
    projections,
  };
}

function expandedSlotCount(rules: readonly LineupRule[]): number {
  return rules.reduce((total, rule) => total + rule.quantity, 0);
}

function expectValidLineup(
  result: OptimizedLineup,
  optimizationInput: LineupOptimizationInput,
): void {
  const playersById = new Map(
    optimizationInput.players.map((value) => [value.id, value] as const),
  );
  const assignedPlayerIds = result.assignments.map(
    (assignment) => assignment.playerId,
  );

  expect(new Set(assignedPlayerIds).size).toBe(assignedPlayerIds.length);
  expect(result.assignments.length + result.unfilledSlots.length).toBe(
    expandedSlotCount(optimizationInput.lineupRules),
  );
  expect(new Set([...assignedPlayerIds, ...result.benchPlayerIds])).toEqual(
    new Set(optimizationInput.roster.playerIds),
  );
  expect(
    result.assignments.every((assignment) => {
      const assignedPlayer = playersById.get(assignment.playerId);
      return (
        assignedPlayer !== undefined &&
        isPlayerEligibleForSlot(assignedPlayer.position, assignment.slot)
      );
    }),
  ).toBe(true);
  expect(result.totalProjectedPoints).toBe(
    result.assignments.reduce(
      (total, assignment) => total + assignment.projectedPoints,
      0,
    ),
  );
}

describe('optimizeLineup', () => {
  it('selects the known optimal lineup for the controlled fixture', () => {
    const optimizationInput: LineupOptimizationInput = {
      roster: controlledLeague.rosters[0],
      lineupRules: controlledLeague.league.lineupRules,
      players: controlledLeague.players,
      projections: controlledLeague.projections,
    };

    const result = optimizeLineup(optimizationInput);

    expect(result.totalProjectedPoints).toBe(121);
    expect(result.unfilledSlots).toEqual([]);
    expect(result.assignments).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ slot: 'QB', playerId: 'alpha-qb-1' }),
        expect.objectContaining({ slot: 'FLEX', playerId: 'alpha-rb-3' }),
        expect.objectContaining({ slot: 'K', playerId: 'alpha-k-1' }),
        expect.objectContaining({ slot: 'DST', playerId: 'alpha-dst-1' }),
      ]),
    );
    expect(result.benchPlayerIds).toEqual(
      expect.arrayContaining(['alpha-qb-2', 'alpha-wr-3', 'alpha-te-2']),
    );
    expectValidLineup(result, optimizationInput);
  });

  it('selects the known optimal lineup for the second fixture team', () => {
    const optimizationInput: LineupOptimizationInput = {
      roster: controlledLeague.rosters[1],
      lineupRules: controlledLeague.league.lineupRules,
      players: controlledLeague.players,
      projections: controlledLeague.projections,
    };

    const result = optimizeLineup(optimizationInput);

    expect(result.totalProjectedPoints).toBe(116);
    expect(result.unfilledSlots).toEqual([]);
    expect(result.assignments).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ slot: 'QB', playerId: 'bravo-qb-1' }),
        expect.objectContaining({ slot: 'FLEX', playerId: 'bravo-wr-3' }),
        expect.objectContaining({ slot: 'K', playerId: 'bravo-k-1' }),
        expect.objectContaining({ slot: 'DST', playerId: 'bravo-dst-1' }),
      ]),
    );
    expectValidLineup(result, optimizationInput);
  });

  it('avoids a greedy FLEX choice that would leave a required position empty', () => {
    const optimizationInput = input(
      [player('rb', 'RB'), player('wr', 'WR')],
      [
        { slot: 'FLEX', quantity: 1 },
        { slot: 'RB', quantity: 1 },
      ],
      [projection('rb', 10), projection('wr', 9)],
    );

    const result = optimizeLineup(optimizationInput);

    expect(result.assignments).toEqual([
      { slot: 'FLEX', playerId: 'wr', projectedPoints: 9 },
      { slot: 'RB', playerId: 'rb', projectedPoints: 10 },
    ]);
    expect(result.totalProjectedPoints).toBe(19);
    expect(result.unfilledSlots).toEqual([]);
  });

  it('never assigns one player to two compatible slots', () => {
    const optimizationInput = input(
      [player('only-rb', 'RB')],
      [
        { slot: 'RB', quantity: 1 },
        { slot: 'FLEX', quantity: 1 },
      ],
      [projection('only-rb', 12)],
    );

    const result = optimizeLineup(optimizationInput);

    expect(result.assignments).toHaveLength(1);
    expect(result.assignments[0].playerId).toBe('only-rb');
    expect(result.unfilledSlots).toHaveLength(1);
    expectValidLineup(result, optimizationInput);
  });

  it('reports every unfilled slot when the roster lacks eligible players', () => {
    const optimizationInput = input(
      [player('qb', 'QB')],
      [
        { slot: 'QB', quantity: 1 },
        { slot: 'RB', quantity: 2 },
        { slot: 'K', quantity: 1 },
        { slot: 'DST', quantity: 1 },
      ],
      [projection('qb', 20)],
    );

    const result = optimizeLineup(optimizationInput);

    expect(result.assignments).toEqual([
      { slot: 'QB', playerId: 'qb', projectedPoints: 20 },
    ]);
    expect(result.unfilledSlots).toEqual(['RB', 'RB', 'K', 'DST']);
  });

  it('uses zero projections to keep bye and unavailable players behind active alternatives', () => {
    const optimizationInput = input(
      [
        player('bye-rb', 'RB'),
        player('out-rb', 'RB'),
        player('active-rb', 'RB'),
      ],
      [{ slot: 'RB', quantity: 1 }],
      [
        projection('bye-rb', 0, 'BYE'),
        projection('out-rb', 0, 'OUT'),
        projection('active-rb', 8),
      ],
    );

    expect(optimizeLineup(optimizationInput).assignments).toEqual([
      { slot: 'RB', playerId: 'active-rb', projectedPoints: 8 },
    ]);
  });

  it('treats a missing projection as zero instead of dropping the player', () => {
    const optimizationInput = input(
      [player('unprojected-wr', 'WR')],
      [{ slot: 'WR', quantity: 1 }],
    );

    expect(optimizeLineup(optimizationInput)).toEqual({
      assignments: [
        { slot: 'WR', playerId: 'unprojected-wr', projectedPoints: 0 },
      ],
      benchPlayerIds: [],
      unfilledSlots: [],
      totalProjectedPoints: 0,
    });
  });

  it('fills required slots even when every eligible projection is negative', () => {
    const optimizationInput = input(
      [player('negative-wr', 'WR')],
      [{ slot: 'WR', quantity: 1 }],
      [projection('negative-wr', -2.5)],
    );

    const result = optimizeLineup(optimizationInput);

    expect(result.assignments).toEqual([
      { slot: 'WR', playerId: 'negative-wr', projectedPoints: -2.5 },
    ]);
    expect(result.unfilledSlots).toEqual([]);
  });

  it('uses a quarterback in SUPERFLEX when that is the highest valid option', () => {
    const optimizationInput = input(
      [player('qb', 'QB'), player('rb', 'RB')],
      [{ slot: 'SUPERFLEX', quantity: 1 }],
      [projection('qb', 19), projection('rb', 14)],
    );

    expect(optimizeLineup(optimizationInput).assignments).toEqual([
      { slot: 'SUPERFLEX', playerId: 'qb', projectedPoints: 19 },
    ]);
  });

  it('breaks equal-projection ties deterministically by player ID', () => {
    const optimizationInput = input(
      [player('zeta-wr', 'WR'), player('alpha-wr', 'WR')],
      [{ slot: 'WR', quantity: 1 }],
      [projection('zeta-wr', 10), projection('alpha-wr', 10)],
    );

    expect(optimizeLineup(optimizationInput).assignments[0].playerId).toBe(
      'alpha-wr',
    );
    expect(optimizeLineup(optimizationInput)).toEqual(
      optimizeLineup(optimizationInput),
    );
  });

  it('preserves roster, player, projection, and lineup-rule inputs', () => {
    const players = [player('rb', 'RB'), player('wr', 'WR')] as const;
    const rules = [
      { slot: 'RB', quantity: 1 },
      { slot: 'FLEX', quantity: 1 },
    ] as const;
    const projections = [projection('rb', 12), projection('wr', 11)] as const;
    const optimizationInput = input(players, rules, projections);
    const before = structuredClone(optimizationInput);

    optimizeLineup(optimizationInput);

    expect(optimizationInput).toEqual(before);
  });

  it('returns an empty result for an empty roster and no requested slots', () => {
    expect(optimizeLineup(input([], []))).toEqual({
      assignments: [],
      benchPlayerIds: [],
      unfilledSlots: [],
      totalProjectedPoints: 0,
    });
  });

  it('handles a larger ordinary roster without duplicating or losing players', () => {
    const positions: readonly PlayerPosition[] = [
      'QB',
      'RB',
      'WR',
      'TE',
      'K',
      'DST',
    ];
    const players = Array.from({ length: 30 }, (_unused, index) =>
      player(
        `large-${index.toString().padStart(2, '0')}`,
        positions[index % 6],
      ),
    );
    const rules: readonly LineupRule[] = [
      { slot: 'QB', quantity: 1 },
      { slot: 'RB', quantity: 4 },
      { slot: 'WR', quantity: 4 },
      { slot: 'TE', quantity: 2 },
      { slot: 'FLEX', quantity: 2 },
      { slot: 'K', quantity: 1 },
      { slot: 'DST', quantity: 1 },
    ];
    const optimizationInput = input(
      players,
      rules,
      players.map((value, index) => projection(value.id, index / 10)),
    );

    const result = optimizeLineup(optimizationInput);

    expect(result.assignments).toHaveLength(15);
    expect(result.unfilledSlots).toEqual([]);
    expect(result.benchPlayerIds).toHaveLength(15);
    expectValidLineup(result, optimizationInput);
  });

  it.each([
    {
      name: 'duplicate player definitions',
      value: {
        roster: { teamId: 'test-team', playerIds: ['same'] },
        lineupRules: [{ slot: 'RB', quantity: 1 }],
        players: [player('same', 'RB'), player('same', 'WR')],
        projections: [],
      },
      message: 'duplicate player id: same',
    },
    {
      name: 'duplicate roster entries',
      value: {
        roster: { teamId: 'test-team', playerIds: ['rb', 'rb'] },
        lineupRules: [{ slot: 'RB', quantity: 1 }],
        players: [player('rb', 'RB')],
        projections: [],
      },
      message: 'duplicate roster player id: rb',
    },
    {
      name: 'unknown roster players',
      value: {
        roster: { teamId: 'test-team', playerIds: ['missing'] },
        lineupRules: [{ slot: 'RB', quantity: 1 }],
        players: [],
        projections: [],
      },
      message: 'roster references unknown player missing',
    },
    {
      name: 'multiple projections for one roster player',
      value: {
        roster: { teamId: 'test-team', playerIds: ['rb'] },
        lineupRules: [{ slot: 'RB', quantity: 1 }],
        players: [player('rb', 'RB')],
        projections: [projection('rb', 10), projection('rb', 11)],
      },
      message: 'multiple projections supplied for roster player rb',
    },
    {
      name: 'non-finite projections',
      value: {
        roster: { teamId: 'test-team', playerIds: ['rb'] },
        lineupRules: [{ slot: 'RB', quantity: 1 }],
        players: [player('rb', 'RB')],
        projections: [projection('rb', Number.POSITIVE_INFINITY)],
      },
      message: 'projection for rb has a non-finite expected value',
    },
    {
      name: 'non-positive lineup quantities',
      value: {
        roster: { teamId: 'test-team', playerIds: [] },
        lineupRules: [{ slot: 'RB', quantity: 0 }],
        players: [],
        projections: [],
      },
      message: 'lineup rule 0 quantity must be a positive integer',
    },
    {
      name: 'fractional lineup quantities',
      value: {
        roster: { teamId: 'test-team', playerIds: [] },
        lineupRules: [{ slot: 'RB', quantity: 1.5 }],
        players: [],
        projections: [],
      },
      message: 'lineup rule 0 quantity must be a positive integer',
    },
    {
      name: 'unknown lineup slots',
      value: {
        roster: { teamId: 'test-team', playerIds: [] },
        lineupRules: [{ slot: 'BENCH', quantity: 1 }],
        players: [],
        projections: [],
      },
      message: 'lineup rule 0 uses unknown slot BENCH',
    },
    {
      name: 'duplicate lineup rules',
      value: {
        roster: { teamId: 'test-team', playerIds: [] },
        lineupRules: [
          { slot: 'RB', quantity: 1 },
          { slot: 'RB', quantity: 1 },
        ],
        players: [],
        projections: [],
      },
      message: 'duplicate lineup slot rule: RB',
    },
  ] as const)('rejects $name', ({ value, message }) => {
    const invalidInput = value as unknown as LineupOptimizationInput;
    expect(() => optimizeLineup(invalidInput)).toThrow(LineupOptimizationError);
    expect(() => optimizeLineup(invalidInput)).toThrow(message);
  });
});

describe('optimizer comparison with brute-force reference', () => {
  it.each([
    { seed: 0x12345678 },
    { seed: 0x5eed1234 },
    { seed: 0xabcdef01 },
    { seed: 0xc0ffee42 },
    { seed: 0xdeadbeef },
  ])('matches the reference for generated seed $seed', ({ seed }) => {
    let state = seed;
    const random = () => {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      return state / 0x100000000;
    };
    const randomInteger = (minimum: number, maximum: number) =>
      Math.floor(random() * (maximum - minimum + 1)) + minimum;
    const positions: readonly PlayerPosition[] = [
      'QB',
      'RB',
      'WR',
      'TE',
      'K',
      'DST',
    ];
    const slotTypes: readonly LineupRule['slot'][] = [
      'QB',
      'RB',
      'WR',
      'TE',
      'FLEX',
      'SUPERFLEX',
      'K',
      'DST',
    ];

    for (let caseIndex = 0; caseIndex < 200; caseIndex++) {
      const generatedPlayers = Array.from(
        { length: randomInteger(1, 7) },
        (_unused, playerIndex) =>
          player(
            `case-${caseIndex}-player-${playerIndex}`,
            positions[randomInteger(0, positions.length - 1)],
          ),
      );
      const generatedSlots = Array.from(
        { length: randomInteger(1, 5) },
        () => slotTypes[randomInteger(0, slotTypes.length - 1)],
      );
      const slotQuantities = new Map<LineupRule['slot'], number>();
      for (const slot of generatedSlots) {
        slotQuantities.set(slot, (slotQuantities.get(slot) ?? 0) + 1);
      }
      const lineupRules = [...slotQuantities].map(([slot, quantity]) => ({
        slot,
        quantity,
      }));
      const projections = generatedPlayers
        .filter(() => random() >= 0.2)
        .map((generatedPlayer) =>
          projection(
            generatedPlayer.id,
            randomInteger(-50, 300) / 10,
            random() < 0.1 ? 'BYE' : 'ACTIVE',
          ),
        );
      const optimizationInput = input(
        generatedPlayers,
        lineupRules,
        projections,
      );

      const expected = bruteForceLineupReference(optimizationInput);
      const actual = optimizeLineup(optimizationInput);

      expect(actual.assignments).toHaveLength(expected.filledSlots);
      expect(actual.totalProjectedPoints).toBeCloseTo(
        expected.totalProjectedPoints,
        10,
      );
      expectValidLineup(actual, optimizationInput);
    }
  });
});
