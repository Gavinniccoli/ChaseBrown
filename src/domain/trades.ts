import { z } from 'zod';

import type { OptimizedLineup } from './lineup';

export const tradeProposalSchema = z.object({
  teamAId: z.string().trim().min(1),
  teamBId: z.string().trim().min(1),
  teamASends: z.array(z.string().trim().min(1)).min(1),
  teamBSends: z.array(z.string().trim().min(1)).min(1),
});

export type TradeProposal = Readonly<{
  teamAId: string;
  teamBId: string;
  teamASends: readonly string[];
  teamBSends: readonly string[];
}>;

export type TeamTradeImpact = Readonly<{
  before: OptimizedLineup;
  after: OptimizedLineup;
  pointChange: number;
  enteredStartingLineup: readonly string[];
  leftStartingLineup: readonly string[];
}>;

export type TradeAnalysisResult = Readonly<{
  proposal: TradeProposal;
  teamA: TeamTradeImpact;
  teamB: TeamTradeImpact;
}>;
