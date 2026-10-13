import { z } from 'zod';

export const playerPositions = ['QB', 'RB', 'WR', 'TE', 'K', 'DST'] as const;

export const playerPositionSchema = z.enum(playerPositions);

export type PlayerPosition = z.infer<typeof playerPositionSchema>;

export const playerSchema = z.object({
  id: z.string().trim().min(1),
  displayName: z.string().trim().min(1),
  position: playerPositionSchema,
  nflTeam: z.string().trim().min(1).nullable(),
});

export type Player = Readonly<z.infer<typeof playerSchema>>;

export const weeklyStatsSchema = z.object({
  playerId: z.string().trim().min(1),
  season: z.number().int().positive(),
  week: z.number().int().positive(),
  passingYards: z.number().finite().default(0),
  passingTouchdowns: z.number().finite().default(0),
  interceptions: z.number().finite().default(0),
  rushingYards: z.number().finite().default(0),
  rushingTouchdowns: z.number().finite().default(0),
  receptions: z.number().finite().default(0),
  receivingYards: z.number().finite().default(0),
  receivingTouchdowns: z.number().finite().default(0),
  fumblesLost: z.number().finite().default(0),
  extraPointsMade: z.number().finite().default(0),
  extraPointsMissed: z.number().finite().default(0),
  fieldGoalsMadeZeroToThirtyNine: z.number().finite().default(0),
  fieldGoalsMadeFortyToFortyNine: z.number().finite().default(0),
  fieldGoalsMadeFiftyPlus: z.number().finite().default(0),
  fieldGoalsMissed: z.number().finite().default(0),
  defensiveSacks: z.number().finite().default(0),
  defensiveInterceptions: z.number().finite().default(0),
  defensiveFumbleRecoveries: z.number().finite().default(0),
  defensiveTouchdowns: z.number().finite().default(0),
  defensiveSafeties: z.number().finite().default(0),
  defensiveBlockedKicks: z.number().finite().default(0),
  pointsAllowed: z.number().finite().nonnegative().nullable().default(null),
});

export type WeeklyStats = Readonly<z.infer<typeof weeklyStatsSchema>>;
