import { z } from 'zod';

import type { PlayerPosition } from './players';

export const lineupSlotTypes = [
  'QB',
  'RB',
  'WR',
  'TE',
  'FLEX',
  'SUPERFLEX',
  'K',
  'DST',
] as const;

export const lineupSlotTypeSchema = z.enum(lineupSlotTypes);

export type LineupSlotType = z.infer<typeof lineupSlotTypeSchema>;

export const slotEligibility = {
  QB: ['QB'],
  RB: ['RB'],
  WR: ['WR'],
  TE: ['TE'],
  FLEX: ['RB', 'WR', 'TE'],
  SUPERFLEX: ['QB', 'RB', 'WR', 'TE'],
  K: ['K'],
  DST: ['DST'],
} as const satisfies Readonly<
  Record<LineupSlotType, readonly PlayerPosition[]>
>;

export const lineupRuleSchema = z.object({
  slot: lineupSlotTypeSchema,
  quantity: z.number().int().positive(),
});

export type LineupRule = Readonly<z.infer<typeof lineupRuleSchema>>;

export type LineupAssignment = Readonly<{
  slot: LineupSlotType;
  playerId: string;
  projectedPoints: number;
}>;

export type OptimizedLineup = Readonly<{
  assignments: readonly LineupAssignment[];
  benchPlayerIds: readonly string[];
  unfilledSlots: readonly LineupSlotType[];
  totalProjectedPoints: number;
}>;

export function isPlayerEligibleForSlot(
  position: PlayerPosition,
  slot: LineupSlotType,
): boolean {
  return (slotEligibility[slot] as readonly PlayerPosition[]).includes(
    position,
  );
}
