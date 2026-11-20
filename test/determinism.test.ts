import { describe, it, expect } from 'vitest';
import { createSim, step, hashState } from '../src/sim/sim';
import { FLAT_COURSE, COURSE } from '../src/sim/course';
import { decodeLog, encodeLog } from '../src/sim/inputLog';
import { replay } from '../src/sim/replay';
import { botRun } from './helpers/bot';
import { FP } from '../src/sim/fixed';

function peak(holdTicks: number): number {
  const sim = createSim({ ...FLAT_COURSE, obstacles: [] });
  let best = 0;
  for (let t = 0; t < 60; t++) {
    step(sim, t < holdTicks ? 1 : 0);
    best = Math.max(best, sim.r.y);
  }
  return best / FP;
}

describe('runner jump arc', () => {
  it('tap peaks near 50 px, full hold near 88 px', () => {
    const tap = peak(1);
    const full = peak(30);
    console.log(`jump peaks: tap ${tap.toFixed(1)} px, full hold ${full.toFixed(1)} px`);
    expect(tap).toBeGreaterThan(40);
    expect(tap).toBeLessThan(56);
    expect(full).toBeGreaterThan(78);
    expect(full).toBeLessThan(92);
  });
});

describe('replay determinism', () => {
  for (const [name, course] of [['flat', FLAT_COURSE], ['full', COURSE]] as const) {
    it(`2000 seeded bot runs replay identically (${name} course)`, () => {
      let ok = 0;
      let maxBytes = 0;
      for (let seed = 1; seed <= 2000; seed++) {
        const { sim, log } = botRun(course, seed);
        const text = encodeLog(log);
        maxBytes = Math.max(maxBytes, text.length);
        const again = replay(course, decodeLog(text));
        if (
          again.finishTick === sim.finishTick &&
          hashState(again) === hashState(sim) &&
          again.gateHashes.join() === sim.gateHashes.join()
        ) ok++;
      }
      console.log(`${name}: ${ok}/2000 replays matched; largest log ${maxBytes} bytes`);
      expect(ok).toBe(2000);
    });
  }

  it('a 30 s run log is under 2 KB', () => {
    const { log } = botRun(FLAT_COURSE, 7);
    expect(encodeLog(log).length).toBeLessThan(2048);
  });
});
