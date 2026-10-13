import { describe, expect, it } from 'vitest';

import { controlledLeague } from './controlled-league';

describe('controlled league fixture', () => {
  it('loads two complete twelve-player rosters without external data', () => {
    expect(controlledLeague.teams).toHaveLength(2);
    expect(controlledLeague.players).toHaveLength(24);
    expect(controlledLeague.rosters).toHaveLength(2);
    expect(
      controlledLeague.rosters.every(
        (roster) => roster.playerIds.length === 12,
      ),
    ).toBe(true);
  });

  it('uses unique player IDs and one projection per player', () => {
    const playerIds = controlledLeague.players.map((player) => player.id);
    const projectedPlayerIds = controlledLeague.projections.map(
      (projection) => projection.playerId,
    );

    expect(new Set(playerIds)).toHaveLength(24);
    expect(controlledLeague.projections).toHaveLength(24);
    expect(new Set(projectedPlayerIds)).toHaveLength(24);
    expect(new Set(projectedPlayerIds)).toEqual(new Set(playerIds));
  });

  it('contains distinct zero-point bye and injury examples', () => {
    expect(controlledLeague.projections).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          playerId: 'alpha-qb-2',
          availability: 'BYE',
          expectedPoints: 0,
        }),
        expect.objectContaining({
          playerId: 'alpha-te-2',
          availability: 'OUT',
          expectedPoints: 0,
        }),
      ]),
    );
  });

  it('preserves projection cases needed by the future optimizer', () => {
    expect(controlledLeague.projections).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          playerId: 'alpha-rb-3',
          expectedPoints: 13,
        }),
        expect.objectContaining({
          playerId: 'alpha-wr-2',
          expectedPoints: 13,
        }),
        expect.objectContaining({
          playerId: 'bravo-qb-2',
          expectedPoints: 16,
        }),
      ]),
    );
  });
});
