import { describe, it, expect } from 'vitest';
import { COURSE } from '../src/sim/course';
import { botRun } from './helpers/bot';
import { recordFromSim } from '../src/booth/record';
import { verifyGhost } from '../src/game/ghost';

describe('ghost verification', () => {
  const { sim, log } = botRun(COURSE, 42);
  const rec = recordFromSim(sim, log, { id: 'x', initials: 'ABC', courseVersion: 'v', rivalId: null, beatRival: false, createdAt: 0 });
  it('accepts an untouched log', () => {
    expect(verifyGhost(COURSE, rec)).toBe(true);
  });
  it('rejects a tampered log', () => {
    const tampered = { ...rec, inputs: rec.inputs!.map(([t, m], i) => [t, i % 3 === 0 ? m ^ 1 : m] as [number, number]) };
    expect(verifyGhost(COURSE, tampered)).toBe(false);
  });
});
