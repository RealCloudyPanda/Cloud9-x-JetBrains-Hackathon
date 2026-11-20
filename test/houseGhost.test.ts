import { describe, it, expect } from 'vitest';
import house from '../src/game/houseGhost.json';
import { COURSE } from '../src/sim/course';
import { courseVersion } from '../src/sim/courseVersion';
import { verifyGhost } from '../src/game/ghost';
import type { GhostRecord } from '../src/booth/record';
import { EXPERT } from '../src/sim/autopilot';
import { runAutopilot } from '../scripts/autopilotRuns';

describe('house ghost', () => {
  const rec = house as unknown as GhostRecord;
  it('matches the current Course Version', () => {
    expect(rec.courseVersion).toBe(courseVersion(COURSE));
  });
  it('replays with matching gate hashes', () => {
    expect(verifyGhost(COURSE, rec)).toBe(true);
  });
  it('finishes in 27–31 s', () => {
    expect(rec.finishTick / 60).toBeGreaterThanOrEqual(27);
    expect(rec.finishTick / 60).toBeLessThanOrEqual(31);
  });
  it('an error-free expert run takes 22–26 s with no hits', () => {
    const { sim } = runAutopilot(EXPERT);
    expect(sim.hits.reduce((a, b) => a + b)).toBe(0);
    expect(sim.finishTick / 60).toBeGreaterThanOrEqual(22);
    expect(sim.finishTick / 60).toBeLessThanOrEqual(26);
  });
});
