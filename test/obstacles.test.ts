import { describe, it, expect } from 'vitest';
import { actAt, oneObstacle } from './helpers/script';
import { OBS_HIT, OBS_PERFECT, OBS_CLEAR, createSim, step } from '../src/sim/sim';
import { COURSE } from '../src/sim/course';
import { BEAM_HIGH, BEAM_LOW, lockBeam } from '../src/sim/obstacles';
import { TUNING } from '../src/sim/tuning';
import { FP } from '../src/sim/fixed';
import { courseVersion } from '../src/sim/courseVersion';

describe('obstacles', () => {
  it('a Hurdle cleared by a jump inside the window is a Perfect', () => {
    const sim = actAt(oneObstacle({ kind: 'hurdle', x: 500 }), 500, 36, 1, 6);
    expect(sim.obsState[0]).toBe(OBS_PERFECT);
    expect(sim.perfects.reduce((a, b) => a + b)).toBe(1);
  });

  it('an early jump over a Hurdle is a clean clear, not Perfect', () => {
    const sim = actAt(oneObstacle({ kind: 'hurdle', x: 500 }), 500, 70, 1, 14);
    expect(sim.obsState[0]).toBe(OBS_CLEAR);
  });

  it('running into a Hurdle is a Hit and the runner passes through', () => {
    const sim = actAt(oneObstacle({ kind: 'hurdle', x: 500 }), 500, 0, 0, 0);
    expect(sim.obsState[0]).toBe(OBS_HIT);
    expect(sim.hits.reduce((a, b) => a + b)).toBe(1);
    expect(sim.hitKinds.flat()).toEqual(['hurdle']);
  });

  it('a Low Bar is cleared by a Slide and hit when standing or jumping', () => {
    expect(actAt(oneObstacle({ kind: 'lowbar', x: 500 }), 500, 30, 2, 40).obsState[0]).toBe(OBS_PERFECT);
    expect(actAt(oneObstacle({ kind: 'lowbar', x: 500 }), 500, 0, 0, 0).obsState[0]).toBe(OBS_HIT);
    expect(actAt(oneObstacle({ kind: 'lowbar', x: 500 }), 500, 30, 1, 14).obsState[0]).toBe(OBS_HIT);
  });

  it('a held Jump clears a Pit; a tap lands in it and is placed at the far edge', () => {
    expect(actAt(oneObstacle({ kind: 'pit', x: 500 }), 500, 18, 1, 14).obsState[0]).toBe(OBS_PERFECT);
    const tap = actAt(oneObstacle({ kind: 'pit', x: 500 }), 500, 30, 1, 1);
    expect(tap.obsState[0]).toBe(OBS_HIT);
    expect(tap.r.x).toBeGreaterThanOrEqual(630 * FP);
  });

  it('Switch Beam reveals its fixed course answer at the trigger line', () => {
    expect(lockBeam({ kind: 'beam', x: 500, beamAnswer: 'jump' })).toBe(BEAM_LOW);
    expect(lockBeam({ kind: 'beam', x: 500, beamAnswer: 'slide' })).toBe(BEAM_HIGH);
    const sim = createSim(oneObstacle({ kind: 'beam', x: 500 }));
    let lockTick = -1;
    while (!sim.finished && lockTick < 0) {
      step(sim, 0);
      if (sim.events.some((e) => e.type === 'beamLock')) lockTick = sim.tick;
    }
    expect(sim.beams[0]).toBe(BEAM_LOW);
  });

  it('a no-input Run on the full Course finishes before the cap', () => {
    const sim = createSim(COURSE);
    while (!sim.finished) step(sim, 0);
    expect(sim.dnf).toBe(0);
    expect(sim.finishTick).toBeLessThan(TUNING.timeCap);
    expect(sim.splits.every((s) => s > 0)).toBe(true);
    console.log(`no-input run: ${(sim.finishTick / 60).toFixed(2)} s, hits ${sim.hits.join(',')}`);
  });

  it('course version is stable and changes with the course', () => {
    expect(courseVersion(COURSE)).toBe(courseVersion(COURSE));
    expect(courseVersion({ ...COURSE, length: 1 })).not.toBe(courseVersion(COURSE));
  });
});
