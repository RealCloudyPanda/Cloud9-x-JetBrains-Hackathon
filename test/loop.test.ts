import { describe, it, expect } from 'vitest';
import { advanceAccumulator, TICK_MS } from '../src/game/loop';

describe('fixed-step accumulator', () => {
  it('a 2 s stall yields at most 5 Ticks and drops the rest', () => {
    const r = advanceAccumulator(0, 2000);
    expect(r.ticks).toBe(5);
    expect(r.acc).toBe(0);
  });
  it('accumulates partial frames', () => {
    let acc = 0;
    let ticks = 0;
    for (let i = 0; i < 120; i++) {
      const r = advanceAccumulator(acc, 1000 / 120);
      acc = r.acc;
      ticks += r.ticks;
    }
    expect(ticks).toBeGreaterThanOrEqual(59);
    expect(ticks).toBeLessThanOrEqual(60);
    expect(acc).toBeLessThan(TICK_MS);
  });
});
