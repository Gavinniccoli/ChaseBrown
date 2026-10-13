import type { ScoringEvent, ScoringSettings, WeeklyStats } from '@/domain';

type CountedStat = Exclude<
  keyof WeeklyStats,
  'playerId' | 'season' | 'week' | 'pointsAllowed'
>;

const countedStatEvents = [
  ['passingYards', 'passingYard'],
  ['passingTouchdowns', 'passingTouchdown'],
  ['interceptions', 'interception'],
  ['rushingYards', 'rushingYard'],
  ['rushingTouchdowns', 'rushingTouchdown'],
  ['receptions', 'reception'],
  ['receivingYards', 'receivingYard'],
  ['receivingTouchdowns', 'receivingTouchdown'],
  ['fumblesLost', 'fumbleLost'],
  ['extraPointsMade', 'extraPointMade'],
  ['extraPointsMissed', 'extraPointMissed'],
  ['fieldGoalsMadeZeroToThirtyNine', 'fieldGoalMadeZeroToThirtyNine'],
  ['fieldGoalsMadeFortyToFortyNine', 'fieldGoalMadeFortyToFortyNine'],
  ['fieldGoalsMadeFiftyPlus', 'fieldGoalMadeFiftyPlus'],
  ['fieldGoalsMissed', 'fieldGoalMissed'],
  ['defensiveSacks', 'defensiveSack'],
  ['defensiveInterceptions', 'defensiveInterception'],
  ['defensiveFumbleRecoveries', 'defensiveFumbleRecovery'],
  ['defensiveTouchdowns', 'defensiveTouchdown'],
  ['defensiveSafeties', 'defensiveSafety'],
  ['defensiveBlockedKicks', 'defensiveBlockedKick'],
] as const satisfies readonly (readonly [CountedStat, ScoringEvent])[];

function pointsAllowedEvent(pointsAllowed: number): ScoringEvent {
  if (pointsAllowed === 0) return 'defensePointsAllowedZero';
  if (pointsAllowed <= 6) return 'defensePointsAllowedOneToSix';
  if (pointsAllowed <= 13) return 'defensePointsAllowedSevenToThirteen';
  if (pointsAllowed <= 20) return 'defensePointsAllowedFourteenToTwenty';
  if (pointsAllowed <= 27) return 'defensePointsAllowedTwentyOneToTwentySeven';
  if (pointsAllowed <= 34) return 'defensePointsAllowedTwentyEightToThirtyFour';
  return 'defensePointsAllowedThirtyFivePlus';
}

function eventValue(settings: ScoringSettings, event: ScoringEvent): number {
  return settings.points[event] ?? 0;
}

export function calculateFantasyPoints(
  stats: WeeklyStats,
  settings: ScoringSettings,
): number {
  let total = 0;

  for (const [stat, event] of countedStatEvents) {
    total += stats[stat] * eventValue(settings, event);
  }

  if (stats.pointsAllowed !== null) {
    total += eventValue(settings, pointsAllowedEvent(stats.pointsAllowed));
  }

  return total;
}
