import {
  validateLeagueSnapshot,
  type FantasyLeague,
  type FantasyRoster,
  type FantasyTeam,
  type Player,
  type ProjectionAvailability,
  type WeeklyProjection,
} from '@/domain';

const fixtureSeason = 2026;
const fixtureWeek = 8;
const fixtureModelVersion = 'controlled-fixture-v1';
const fixtureGeneratedAt = '2026-09-01T00:00:00.000Z';

const league: FantasyLeague = {
  id: 'fixture-league',
  name: 'Controlled PPR League',
  season: fixtureSeason,
  scoring: {
    points: {
      passingYard: 0.04,
      passingTouchdown: 4,
      interception: -2,
      rushingYard: 0.1,
      rushingTouchdown: 6,
      reception: 1,
      receivingYard: 0.1,
      receivingTouchdown: 6,
      fumbleLost: -2,
      extraPointMade: 1,
      fieldGoalMadeZeroToThirtyNine: 3,
      fieldGoalMadeFortyToFortyNine: 4,
      fieldGoalMadeFiftyPlus: 5,
      defensiveSack: 1,
      defensiveInterception: 2,
      defensiveFumbleRecovery: 2,
      defensiveTouchdown: 6,
      defensiveSafety: 2,
      defensiveBlockedKick: 2,
      defensePointsAllowedZero: 10,
      defensePointsAllowedOneToSix: 7,
      defensePointsAllowedSevenToThirteen: 4,
      defensePointsAllowedFourteenToTwenty: 1,
      defensePointsAllowedTwentyOneToTwentySeven: 0,
      defensePointsAllowedTwentyEightToThirtyFour: -1,
      defensePointsAllowedThirtyFivePlus: -4,
    },
  },
  lineupRules: [
    { slot: 'QB', quantity: 1 },
    { slot: 'RB', quantity: 2 },
    { slot: 'WR', quantity: 2 },
    { slot: 'TE', quantity: 1 },
    { slot: 'FLEX', quantity: 1 },
    { slot: 'K', quantity: 1 },
    { slot: 'DST', quantity: 1 },
  ],
};

const teams: readonly FantasyTeam[] = [
  { id: 'team-alpha', leagueId: league.id, displayName: 'Team Alpha' },
  { id: 'team-bravo', leagueId: league.id, displayName: 'Team Bravo' },
];

const players: readonly Player[] = [
  {
    id: 'alpha-qb-1',
    displayName: 'Alpha Quarterback One',
    position: 'QB',
    nflTeam: 'ALP',
  },
  {
    id: 'alpha-qb-2',
    displayName: 'Alpha Quarterback Two',
    position: 'QB',
    nflTeam: 'ALP',
  },
  {
    id: 'alpha-rb-1',
    displayName: 'Alpha Running Back One',
    position: 'RB',
    nflTeam: 'ALP',
  },
  {
    id: 'alpha-rb-2',
    displayName: 'Alpha Running Back Two',
    position: 'RB',
    nflTeam: 'ALP',
  },
  {
    id: 'alpha-rb-3',
    displayName: 'Alpha Running Back Three',
    position: 'RB',
    nflTeam: 'ALP',
  },
  {
    id: 'alpha-wr-1',
    displayName: 'Alpha Receiver One',
    position: 'WR',
    nflTeam: 'ALP',
  },
  {
    id: 'alpha-wr-2',
    displayName: 'Alpha Receiver Two',
    position: 'WR',
    nflTeam: 'ALP',
  },
  {
    id: 'alpha-wr-3',
    displayName: 'Alpha Receiver Three',
    position: 'WR',
    nflTeam: 'ALP',
  },
  {
    id: 'alpha-te-1',
    displayName: 'Alpha Tight End One',
    position: 'TE',
    nflTeam: 'ALP',
  },
  {
    id: 'alpha-te-2',
    displayName: 'Alpha Tight End Two',
    position: 'TE',
    nflTeam: 'ALP',
  },
  {
    id: 'alpha-k-1',
    displayName: 'Alpha Kicker',
    position: 'K',
    nflTeam: 'ALP',
  },
  {
    id: 'alpha-dst-1',
    displayName: 'Alpha Defense',
    position: 'DST',
    nflTeam: 'ALP',
  },
  {
    id: 'bravo-qb-1',
    displayName: 'Bravo Quarterback One',
    position: 'QB',
    nflTeam: 'BRV',
  },
  {
    id: 'bravo-qb-2',
    displayName: 'Bravo Quarterback Two',
    position: 'QB',
    nflTeam: 'BRV',
  },
  {
    id: 'bravo-rb-1',
    displayName: 'Bravo Running Back One',
    position: 'RB',
    nflTeam: 'BRV',
  },
  {
    id: 'bravo-rb-2',
    displayName: 'Bravo Running Back Two',
    position: 'RB',
    nflTeam: 'BRV',
  },
  {
    id: 'bravo-rb-3',
    displayName: 'Bravo Running Back Three',
    position: 'RB',
    nflTeam: 'BRV',
  },
  {
    id: 'bravo-wr-1',
    displayName: 'Bravo Receiver One',
    position: 'WR',
    nflTeam: 'BRV',
  },
  {
    id: 'bravo-wr-2',
    displayName: 'Bravo Receiver Two',
    position: 'WR',
    nflTeam: 'BRV',
  },
  {
    id: 'bravo-wr-3',
    displayName: 'Bravo Receiver Three',
    position: 'WR',
    nflTeam: 'BRV',
  },
  {
    id: 'bravo-te-1',
    displayName: 'Bravo Tight End One',
    position: 'TE',
    nflTeam: 'BRV',
  },
  {
    id: 'bravo-te-2',
    displayName: 'Bravo Tight End Two',
    position: 'TE',
    nflTeam: 'BRV',
  },
  {
    id: 'bravo-k-1',
    displayName: 'Bravo Kicker',
    position: 'K',
    nflTeam: 'BRV',
  },
  {
    id: 'bravo-dst-1',
    displayName: 'Bravo Defense',
    position: 'DST',
    nflTeam: 'BRV',
  },
];

const rosters: readonly FantasyRoster[] = [
  {
    teamId: 'team-alpha',
    playerIds: players.slice(0, 12).map((player) => player.id),
  },
  {
    teamId: 'team-bravo',
    playerIds: players.slice(12).map((player) => player.id),
  },
];

function projection(
  playerId: string,
  expectedPoints: number,
  availability: ProjectionAvailability = 'ACTIVE',
): WeeklyProjection {
  const unavailable = ['OUT', 'IR', 'BYE', 'SUSPENDED'].includes(availability);

  return {
    playerId,
    season: fixtureSeason,
    week: fixtureWeek,
    expectedPoints,
    lowPoints: unavailable ? 0 : Math.max(0, expectedPoints - 4),
    highPoints: unavailable ? 0 : expectedPoints + 4,
    availability,
    modelVersion: fixtureModelVersion,
    generatedAt: fixtureGeneratedAt,
  };
}

const projections: readonly WeeklyProjection[] = [
  projection('alpha-qb-1', 22),
  projection('alpha-qb-2', 0, 'BYE'),
  projection('alpha-rb-1', 18),
  projection('alpha-rb-2', 14),
  projection('alpha-rb-3', 13),
  projection('alpha-wr-1', 17),
  projection('alpha-wr-2', 13),
  projection('alpha-wr-3', 12),
  projection('alpha-te-1', 9),
  projection('alpha-te-2', 0, 'OUT'),
  projection('alpha-k-1', 8),
  projection('alpha-dst-1', 7),
  projection('bravo-qb-1', 19),
  projection('bravo-qb-2', 16),
  projection('bravo-rb-1', 16),
  projection('bravo-rb-2', 8),
  projection('bravo-rb-3', 6),
  projection('bravo-wr-1', 20),
  projection('bravo-wr-2', 15),
  projection('bravo-wr-3', 10),
  projection('bravo-te-1', 11),
  projection('bravo-te-2', 7),
  projection('bravo-k-1', 9),
  projection('bravo-dst-1', 8),
];

export const controlledLeague = validateLeagueSnapshot({
  league,
  players,
  teams,
  rosters,
  projections,
});

export const controlledLeagueFixtureMetadata = {
  season: fixtureSeason,
  week: fixtureWeek,
  modelVersion: fixtureModelVersion,
} as const;
