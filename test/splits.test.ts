import { describe, it, expect } from 'vitest';
import { formatDelta, gateDelta, segmentDeltas } from '../src/sim/splits';

describe('split deltas', () => {
  const player = [300, 620, 900, 1260, 1500, 1800];
  const ghost = [320, 600, 930, 1200, 1530, 1790];
  it('segment deltas match hand-computed values', () => {
    expect(segmentDeltas(player, ghost)).toEqual([-20, 40, -50, 90, -90, 40]);
  });
  it('gate delta is cumulative', () => {
    expect(gateDelta(player, ghost, 5)).toBe(10);
    expect(gateDelta(player, ghost, 0)).toBe(-20);
  });
  it('missing splits give null', () => {
    expect(segmentDeltas([300, -1], [310, 600])).toEqual([-10, null]);
  });
  it('formats with explicit sign', () => {
    expect(formatDelta(-11)).toBe('−0.18');
    expect(formatDelta(19)).toBe('+0.32');
    expect(formatDelta(0)).toBe('+0.00');
  });
});
