import { describe, expect, it } from 'vitest';

import { weeklyStatsSchema, type ScoringSettings } from '@/domain';

import { calculateFantasyPoints } from './calculate-fantasy-points';

const standardScoring: ScoringSettings = {
  points: {
    passingYard: 0.04,
    passingTouchdown: 4,
    interception: -2,
    rushingYard: 0.1,
    rushingTouchdown: 6,
    reception: 0,
    receivingYard: 0.1,
    receivingTouchdown: 6,
    fumbleLost: -2,
  },
};

function stats(overrides: Record<string, number | null> = {}) {
  return weeklyStatsSchema.parse({
    playerId: 'test-player',
    season: 2026,
    week: 1,
    ...overrides,
  });
}

describe('calculateFantasyPoints', () => {
  it.each([
    ['standard', 0, 16],
    ['half-PPR', 0.5, 21],
    ['full PPR', 1, 26],
  ])(
    'calculates a hand-checked receiving line in %s scoring',
    (_format, receptionPoints, expected) => {
      const scoring: ScoringSettings = {
        points: { ...standardScoring.points, reception: receptionPoints },
      };

      expect(
        calculateFantasyPoints(
          stats({
            receptions: 10,
            receivingYards: 100,
            receivingTouchdowns: 1,
          }),
          scoring,
        ),
      ).toBe(expected);
    },
  );

  it('calculates passing points with a negative interception value', () => {
    expect(
      calculateFantasyPoints(
        stats({
          passingYards: 300,
          passingTouchdowns: 3,
          interceptions: 1,
        }),
        standardScoring,
      ),
    ).toBe(22);
  });

  it('supports decimal scoring multipliers without rounding the result', () => {
    const decimalScoring: ScoringSettings = {
      points: {
        passingYard: 0.025,
        passingTouchdown: 5.5,
        rushingYard: 0.125,
      },
    };

    expect(
      calculateFantasyPoints(
        stats({
          passingYards: 275,
          passingTouchdowns: 2,
          rushingYards: 17,
        }),
        decimalScoring,
      ),
    ).toBe(20);
  });

  it('allows negative yardage to reduce a score', () => {
    expect(
      calculateFantasyPoints(
        stats({ rushingYards: -10, receivingYards: -5 }),
        standardScoring,
      ),
    ).toBe(-1.5);
  });

  it('treats omitted statistics and omitted scoring events as zero', () => {
    expect(calculateFantasyPoints(stats(), standardScoring)).toBe(0);
    expect(
      calculateFantasyPoints(stats({ receptions: 8 }), { points: {} }),
    ).toBe(0);
  });

  it('does not apply a shutout bonus when points allowed is not applicable', () => {
    const scoring: ScoringSettings = {
      points: { defensePointsAllowedZero: 10 },
    };

    expect(calculateFantasyPoints(stats(), scoring)).toBe(0);
    expect(calculateFantasyPoints(stats({ pointsAllowed: 0 }), scoring)).toBe(
      10,
    );
  });

  it('calculates kicker scoring', () => {
    const kickerScoring: ScoringSettings = {
      points: {
        extraPointMade: 1,
        extraPointMissed: -1,
        fieldGoalMadeZeroToThirtyNine: 3,
        fieldGoalMadeFortyToFortyNine: 4,
        fieldGoalMadeFiftyPlus: 5,
        fieldGoalMissed: -1,
      },
    };

    expect(
      calculateFantasyPoints(
        stats({
          extraPointsMade: 3,
          extraPointsMissed: 1,
          fieldGoalsMadeZeroToThirtyNine: 1,
          fieldGoalsMadeFortyToFortyNine: 1,
          fieldGoalsMadeFiftyPlus: 1,
          fieldGoalsMissed: 1,
        }),
        kickerScoring,
      ),
    ).toBe(13);
  });

  it('combines team-defense counting stats with exactly one points-allowed tier', () => {
    const defenseScoring: ScoringSettings = {
      points: {
        defensiveSack: 1,
        defensiveInterception: 2,
        defensiveFumbleRecovery: 2,
        defensiveTouchdown: 6,
        defensiveSafety: 2,
        defensiveBlockedKick: 2,
        defensePointsAllowedSevenToThirteen: 4,
      },
    };

    expect(
      calculateFantasyPoints(
        stats({
          defensiveSacks: 3,
          defensiveInterceptions: 2,
          defensiveFumbleRecoveries: 1,
          defensiveTouchdowns: 1,
          defensiveSafeties: 1,
          defensiveBlockedKicks: 1,
          pointsAllowed: 10,
        }),
        defenseScoring,
      ),
    ).toBe(23);
  });

  it.each([
    [0, 'defensePointsAllowedZero'],
    [1, 'defensePointsAllowedOneToSix'],
    [6, 'defensePointsAllowedOneToSix'],
    [7, 'defensePointsAllowedSevenToThirteen'],
    [13, 'defensePointsAllowedSevenToThirteen'],
    [14, 'defensePointsAllowedFourteenToTwenty'],
    [20, 'defensePointsAllowedFourteenToTwenty'],
    [21, 'defensePointsAllowedTwentyOneToTwentySeven'],
    [27, 'defensePointsAllowedTwentyOneToTwentySeven'],
    [28, 'defensePointsAllowedTwentyEightToThirtyFour'],
    [34, 'defensePointsAllowedTwentyEightToThirtyFour'],
    [35, 'defensePointsAllowedThirtyFivePlus'],
  ] as const)(
    'uses the correct points-allowed tier for %i points',
    (pointsAllowed, event) => {
      const scoring: ScoringSettings = { points: { [event]: 7 } };

      expect(calculateFantasyPoints(stats({ pointsAllowed }), scoring)).toBe(7);
    },
  );
});
