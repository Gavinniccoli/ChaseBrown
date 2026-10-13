import { describe, expect, it } from 'vitest';

import { isPlayerEligibleForSlot } from './lineup';

describe('lineup-slot eligibility', () => {
  it('limits FLEX to running backs, receivers, and tight ends', () => {
    expect(isPlayerEligibleForSlot('RB', 'FLEX')).toBe(true);
    expect(isPlayerEligibleForSlot('WR', 'FLEX')).toBe(true);
    expect(isPlayerEligibleForSlot('TE', 'FLEX')).toBe(true);
    expect(isPlayerEligibleForSlot('QB', 'FLEX')).toBe(false);
    expect(isPlayerEligibleForSlot('K', 'FLEX')).toBe(false);
    expect(isPlayerEligibleForSlot('DST', 'FLEX')).toBe(false);
  });

  it('allows offensive skill positions in SUPERFLEX but excludes K and DST', () => {
    expect(isPlayerEligibleForSlot('QB', 'SUPERFLEX')).toBe(true);
    expect(isPlayerEligibleForSlot('RB', 'SUPERFLEX')).toBe(true);
    expect(isPlayerEligibleForSlot('WR', 'SUPERFLEX')).toBe(true);
    expect(isPlayerEligibleForSlot('TE', 'SUPERFLEX')).toBe(true);
    expect(isPlayerEligibleForSlot('K', 'SUPERFLEX')).toBe(false);
    expect(isPlayerEligibleForSlot('DST', 'SUPERFLEX')).toBe(false);
  });

  it('requires an exact match for fixed slots', () => {
    expect(isPlayerEligibleForSlot('K', 'K')).toBe(true);
    expect(isPlayerEligibleForSlot('DST', 'DST')).toBe(true);
    expect(isPlayerEligibleForSlot('WR', 'RB')).toBe(false);
  });
});
