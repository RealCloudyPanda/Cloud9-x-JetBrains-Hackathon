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
  it('rejects falsified split and finish data even when the input log is unchanged', () => {
    const splits = rec.splits.map((tick, i) => i === 0 ? tick - 1 : tick);
    expect(verifyGhost(COURSE, { ...rec, splits })).toBe(false);
    expect(verifyGhost(COURSE, { ...rec, dnf: !rec.dnf })).toBe(false);
    expect(verifyGhost(COURSE, { ...rec, finishTick: rec.finishTick + 1 })).toBe(false);
  });
  it('rejects malformed persisted input events without throwing', () => {
    const malformed = JSON.parse('[null]') as typeof rec.inputs;
    expect(verifyGhost(COURSE, { ...rec, inputs: malformed })).toBe(false);
    expect(verifyGhost(COURSE, { ...rec, inputs: [[0, 1], [0, 0]] })).toBe(false);
    expect(verifyGhost(COURSE, { ...rec, inputs: [[rec.finishTick, 1]] })).toBe(false);
  });
});
