import { z } from 'zod';

import { lineupRuleSchema } from './lineup';
import type { Player, WeeklyStats } from './players';
import type { WeeklyProjection } from './projections';

export const scoringEvents = [
  'passingYard',
  'passingTouchdown',
  'interception',
  'rushingYard',
  'rushingTouchdown',
  'reception',
  'receivingYard',
  'receivingTouchdown',
  'fumbleLost',
  'extraPointMade',
  'extraPointMissed',
  'fieldGoalMadeZeroToThirtyNine',
  'fieldGoalMadeFortyToFortyNine',
  'fieldGoalMadeFiftyPlus',
  'fieldGoalMissed',
  'defensiveSack',
  'defensiveInterception',
  'defensiveFumbleRecovery',
  'defensiveTouchdown',
  'defensiveSafety',
  'defensiveBlockedKick',
  'defensePointsAllowedZero',
  'defensePointsAllowedOneToSix',
  'defensePointsAllowedSevenToThirteen',
  'defensePointsAllowedFourteenToTwenty',
  'defensePointsAllowedTwentyOneToTwentySeven',
  'defensePointsAllowedTwentyEightToThirtyFour',
  'defensePointsAllowedThirtyFivePlus',
] as const;

export const scoringEventSchema = z.enum(scoringEvents);

export type ScoringEvent = z.infer<typeof scoringEventSchema>;

export const scoringSettingsSchema = z.object({
  points: z.partialRecord(scoringEventSchema, z.number().finite()),
});

export type ScoringSettings = Readonly<{
  points: Readonly<Partial<Record<ScoringEvent, number>>>;
}>;

export const fantasyLeagueSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1),
  season: z.number().int().positive(),
  scoring: scoringSettingsSchema,
  lineupRules: z.array(lineupRuleSchema).min(1),
});

export type FantasyLeague = Readonly<
  Omit<z.infer<typeof fantasyLeagueSchema>, 'scoring' | 'lineupRules'> & {
    scoring: ScoringSettings;
    lineupRules: readonly z.infer<typeof lineupRuleSchema>[];
  }
>;

export const fantasyTeamSchema = z.object({
  id: z.string().trim().min(1),
  leagueId: z.string().trim().min(1),
  displayName: z.string().trim().min(1),
});

export type FantasyTeam = Readonly<z.infer<typeof fantasyTeamSchema>>;

export const fantasyRosterSchema = z.object({
  teamId: z.string().trim().min(1),
  playerIds: z.array(z.string().trim().min(1)),
});

export type FantasyRoster = Readonly<{
  teamId: string;
  playerIds: readonly string[];
}>;

export type LeagueSnapshot = Readonly<{
  league: FantasyLeague;
  players: readonly Player[];
  teams: readonly FantasyTeam[];
  rosters: readonly FantasyRoster[];
  projections: readonly WeeklyProjection[];
  stats?: readonly WeeklyStats[];
}>;
