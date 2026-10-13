import {
  isPlayerEligibleForSlot,
  type LineupSlotType,
  type Player,
} from '@/domain';

import type { LineupOptimizationInput } from './optimize-lineup';

export type ReferenceLineupResult = Readonly<{
  filledSlots: number;
  totalProjectedPoints: number;
}>;

function isBetter(
  candidate: ReferenceLineupResult,
  current: ReferenceLineupResult,
): boolean {
  return (
    candidate.filledSlots > current.filledSlots ||
    (candidate.filledSlots === current.filledSlots &&
      candidate.totalProjectedPoints > current.totalProjectedPoints)
  );
}

export function bruteForceLineupReference(
  input: LineupOptimizationInput,
): ReferenceLineupResult {
  const slots: LineupSlotType[] = input.lineupRules.flatMap((rule) =>
    Array<LineupSlotType>(rule.quantity).fill(rule.slot),
  );
  const playersById = new Map(
    input.players.map((player) => [player.id, player] as const),
  );
  const rosterPlayers = input.roster.playerIds
    .map((playerId) => playersById.get(playerId))
    .filter((player): player is Player => player !== undefined);
  const pointsByPlayerId = new Map(
    input.projections.map(
      (projection) => [projection.playerId, projection.expectedPoints] as const,
    ),
  );

  function search(
    slotIndex: number,
    usedPlayerIds: ReadonlySet<string>,
  ): ReferenceLineupResult {
    if (slotIndex === slots.length) {
      return { filledSlots: 0, totalProjectedPoints: 0 };
    }

    let best = search(slotIndex + 1, usedPlayerIds);

    for (const player of rosterPlayers) {
      if (
        usedPlayerIds.has(player.id) ||
        !isPlayerEligibleForSlot(player.position, slots[slotIndex])
      ) {
        continue;
      }

      const nextUsedPlayerIds = new Set(usedPlayerIds);
      nextUsedPlayerIds.add(player.id);
      const remaining = search(slotIndex + 1, nextUsedPlayerIds);
      const candidate = {
        filledSlots: remaining.filledSlots + 1,
        totalProjectedPoints:
          remaining.totalProjectedPoints +
          (pointsByPlayerId.get(player.id) ?? 0),
      };

      if (isBetter(candidate, best)) best = candidate;
    }

    return best;
  }

  return search(0, new Set());
}
