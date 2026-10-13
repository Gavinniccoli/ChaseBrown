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
  passingYards: z.number().finite(),
  passingTouchdowns: z.number().finite(),
  interceptions: z.number().finite(),
  rushingYards: z.number().finite(),
  rushingTouchdowns: z.number().finite(),
  receptions: z.number().finite(),
  receivingYards: z.number().finite(),
  receivingTouchdowns: z.number().finite(),
  fumblesLost: z.number().finite(),
  extraPointsMade: z.number().finite(),
  extraPointsMissed: z.number().finite(),
  fieldGoalsMadeZeroToThirtyNine: z.number().finite(),
  fieldGoalsMadeFortyToFortyNine: z.number().finite(),
  fieldGoalsMadeFiftyPlus: z.number().finite(),
  fieldGoalsMissed: z.number().finite(),
  defensiveSacks: z.number().finite(),
  defensiveInterceptions: z.number().finite(),
  defensiveFumbleRecoveries: z.number().finite(),
  defensiveTouchdowns: z.number().finite(),
  defensiveSafeties: z.number().finite(),
  defensiveBlockedKicks: z.number().finite(),
  pointsAllowed: z.number().finite(),
});

export type WeeklyStats = Readonly<z.infer<typeof weeklyStatsSchema>>;
