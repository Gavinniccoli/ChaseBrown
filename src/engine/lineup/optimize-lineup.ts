import {
  isPlayerEligibleForSlot,
  lineupSlotTypes,
  type FantasyRoster,
  type LineupRule,
  type LineupSlotType,
  type OptimizedLineup,
  type Player,
  type WeeklyProjection,
} from '@/domain';

export type LineupOptimizationInput = Readonly<{
  roster: FantasyRoster;
  lineupRules: readonly LineupRule[];
  players: readonly Player[];
  projections: readonly WeeklyProjection[];
}>;

export class LineupOptimizationError extends Error {
  readonly issues: readonly string[];

  constructor(issues: readonly string[]) {
    super(`Lineup optimization failed: ${issues.join('; ')}`);
    this.name = 'LineupOptimizationError';
    this.issues = issues;
  }
}

type FlowEdge = {
  to: number;
  reverseIndex: number;
  capacity: number;
  cost: number;
};

type SlotInstance = Readonly<{
  index: number;
  slot: LineupSlotType;
}>;

type AssignmentEdge = Readonly<{
  slot: SlotInstance;
  playerId: string;
  projectedPoints: number;
  edge: FlowEdge;
}>;

function findDuplicates(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }

  return [...duplicates];
}

function validateInput(input: LineupOptimizationInput): void {
  const issues: string[] = [];
  const playerIds = input.players.map((player) => player.id);
  const rosterPlayerIds = input.roster.playerIds;
  const knownPlayerIds = new Set(playerIds);
  const rosterPlayerIdSet = new Set(rosterPlayerIds);

  for (const [ruleIndex, rule] of input.lineupRules.entries()) {
    if (!(lineupSlotTypes as readonly string[]).includes(rule.slot)) {
      issues.push(`lineup rule ${ruleIndex} uses unknown slot ${rule.slot}`);
    }
    if (!Number.isInteger(rule.quantity) || rule.quantity <= 0) {
      issues.push(
        `lineup rule ${ruleIndex} quantity must be a positive integer`,
      );
    }
  }

  for (const duplicate of findDuplicates(
    input.lineupRules.map((rule) => rule.slot),
  )) {
    issues.push(`duplicate lineup slot rule: ${duplicate}`);
  }

  for (const duplicate of findDuplicates(playerIds)) {
    issues.push(`duplicate player id: ${duplicate}`);
  }

  for (const duplicate of findDuplicates(rosterPlayerIds)) {
    issues.push(`duplicate roster player id: ${duplicate}`);
  }

  for (const playerId of rosterPlayerIds) {
    if (!knownPlayerIds.has(playerId)) {
      issues.push(`roster references unknown player ${playerId}`);
    }
  }

  const relevantProjections = input.projections.filter((projection) =>
    rosterPlayerIdSet.has(projection.playerId),
  );
  for (const duplicate of findDuplicates(
    relevantProjections.map((projection) => projection.playerId),
  )) {
    issues.push(`multiple projections supplied for roster player ${duplicate}`);
  }

  for (const projection of relevantProjections) {
    if (!Number.isFinite(projection.expectedPoints)) {
      issues.push(
        `projection for ${projection.playerId} has a non-finite expected value`,
      );
    }
  }

  if (issues.length > 0) throw new LineupOptimizationError(issues);
}

function expandLineupRules(lineupRules: readonly LineupRule[]): SlotInstance[] {
  const slots: SlotInstance[] = [];

  for (const rule of lineupRules) {
    for (
      let quantityIndex = 0;
      quantityIndex < rule.quantity;
      quantityIndex++
    ) {
      slots.push({ index: slots.length, slot: rule.slot });
    }
  }

  return slots;
}

function addEdge(
  graph: FlowEdge[][],
  from: number,
  to: number,
  capacity: number,
  cost: number,
): FlowEdge {
  const forward: FlowEdge = {
    to,
    reverseIndex: graph[to].length,
    capacity,
    cost,
  };
  const reverse: FlowEdge = {
    to: from,
    reverseIndex: graph[from].length,
    capacity: 0,
    cost: -cost,
  };

  graph[from].push(forward);
  graph[to].push(reverse);
  return forward;
}

function findShortestAugmentingPath(
  graph: readonly FlowEdge[][],
  source: number,
  sink: number,
): Readonly<{
  previousNodes: readonly number[];
  previousEdges: readonly number[];
}> | null {
  const distances = Array<number>(graph.length).fill(Number.POSITIVE_INFINITY);
  const previousNodes = Array<number>(graph.length).fill(-1);
  const previousEdges = Array<number>(graph.length).fill(-1);
  distances[source] = 0;

  for (let pass = 0; pass < graph.length - 1; pass++) {
    let changed = false;

    for (let from = 0; from < graph.length; from++) {
      if (!Number.isFinite(distances[from])) continue;

      for (let edgeIndex = 0; edgeIndex < graph[from].length; edgeIndex++) {
        const edge = graph[from][edgeIndex];
        if (edge.capacity === 0) continue;

        const candidateDistance = distances[from] + edge.cost;
        if (candidateDistance < distances[edge.to]) {
          distances[edge.to] = candidateDistance;
          previousNodes[edge.to] = from;
          previousEdges[edge.to] = edgeIndex;
          changed = true;
        }
      }
    }

    if (!changed) break;
  }

  if (!Number.isFinite(distances[sink])) return null;
  return { previousNodes, previousEdges };
}

function runMaximumCardinalityMinimumCostFlow(
  graph: FlowEdge[][],
  source: number,
  sink: number,
): void {
  // Every successful path fills one additional slot, so exhausting paths finds
  // maximum cardinality. Bellman-Ford chooses the minimum-cost residual path;
  // assignment costs are negative projections, making minimum cost equivalent
  // to maximum projected points among lineups with that cardinality.
  while (true) {
    const path = findShortestAugmentingPath(graph, source, sink);
    if (path === null) return;

    let node = sink;
    while (node !== source) {
      const previousNode = path.previousNodes[node];
      const edgeIndex = path.previousEdges[node];
      const edge = graph[previousNode][edgeIndex];

      edge.capacity -= 1;
      graph[node][edge.reverseIndex].capacity += 1;
      node = previousNode;
    }
  }
}

export function optimizeLineup(
  input: LineupOptimizationInput,
): OptimizedLineup {
  validateInput(input);

  const slots = expandLineupRules(input.lineupRules);
  const playersById = new Map(
    input.players.map((player) => [player.id, player] as const),
  );
  const projectionsByPlayerId = new Map(
    input.projections.map(
      (projection) => [projection.playerId, projection] as const,
    ),
  );
  const rosterPlayers = input.roster.playerIds
    .map((playerId) => playersById.get(playerId))
    .filter((player): player is Player => player !== undefined)
    .sort((left, right) =>
      left.id < right.id ? -1 : left.id > right.id ? 1 : 0,
    );

  const source = 0;
  const firstSlotNode = 1;
  const firstPlayerNode = firstSlotNode + slots.length;
  const sink = firstPlayerNode + rosterPlayers.length;
  const graph = Array.from({ length: sink + 1 }, () => [] as FlowEdge[]);
  const assignmentEdges: AssignmentEdge[] = [];

  for (const slot of slots) {
    const slotNode = firstSlotNode + slot.index;
    addEdge(graph, source, slotNode, 1, 0);

    rosterPlayers.forEach((player, playerIndex) => {
      if (!isPlayerEligibleForSlot(player.position, slot.slot)) return;

      const projectedPoints =
        projectionsByPlayerId.get(player.id)?.expectedPoints ?? 0;
      const edge = addEdge(
        graph,
        slotNode,
        firstPlayerNode + playerIndex,
        1,
        -projectedPoints,
      );
      assignmentEdges.push({
        slot,
        playerId: player.id,
        projectedPoints,
        edge,
      });
    });
  }

  rosterPlayers.forEach((_player, playerIndex) => {
    addEdge(graph, firstPlayerNode + playerIndex, sink, 1, 0);
  });

  runMaximumCardinalityMinimumCostFlow(graph, source, sink);

  const usedAssignments = assignmentEdges
    .filter((assignment) => assignment.edge.capacity === 0)
    .sort((left, right) => left.slot.index - right.slot.index);
  const assignedPlayerIds = new Set(
    usedAssignments.map((assignment) => assignment.playerId),
  );
  const filledSlotIndexes = new Set(
    usedAssignments.map((assignment) => assignment.slot.index),
  );

  return {
    assignments: usedAssignments.map((assignment) => ({
      slot: assignment.slot.slot,
      playerId: assignment.playerId,
      projectedPoints: assignment.projectedPoints,
    })),
    benchPlayerIds: input.roster.playerIds.filter(
      (playerId) => !assignedPlayerIds.has(playerId),
    ),
    unfilledSlots: slots
      .filter((slot) => !filledSlotIndexes.has(slot.index))
      .map((slot) => slot.slot),
    totalProjectedPoints: usedAssignments.reduce(
      (total, assignment) => total + assignment.projectedPoints,
      0,
    ),
  };
}
