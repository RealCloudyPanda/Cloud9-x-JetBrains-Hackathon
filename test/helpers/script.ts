import { createSim, step, type Sim } from '../../src/sim/sim';
import type { Course, Obstacle } from '../../src/sim/course';
import { FP } from '../../src/sim/fixed';
import { front } from '../../src/sim/runner';

export function oneObstacle(o: Obstacle): Course {
  return {
    length: 1600,
    gates: [700, 800, 900, 1000, 1100, 1600],
    gateLabels: ['G1', 'G2', 'G3', 'G4', 'G5', 'FIN'],
    segmentNames: ['A', 'B', 'C', 'D', 'E', 'F'],
    obstacles: [o],
  };
}

/**
 * Run until the runner front is within `dist` px of x, then hold `mask` for `holdTicks`, then release.
 * Stops once the obstacle at index 0 is resolved (or the run ends).
 */
export function actAt(course: Course, x: number, dist: number, mask: number, holdTicks: number, maxTicks = 400): Sim {
  const sim = createSim(course);
  let started = -1;
  for (let t = 0; t < maxTicks && !sim.finished; t++) {
    if (started < 0 && x * FP - front(sim.r) <= dist * FP) started = t;
    const m = started >= 0 && t - started < holdTicks ? mask : 0;
    step(sim, m);
  }
  return sim;
}
