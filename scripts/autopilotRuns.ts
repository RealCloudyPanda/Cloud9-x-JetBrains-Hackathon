import { COURSE } from '../src/sim/course';
import { createSim, step } from '../src/sim/sim';
import { createRecorder, record } from '../src/sim/inputLog';
import { createAutopilot, type AutopilotOptions } from '../src/sim/autopilot';

export function runAutopilot(opts: AutopilotOptions) {
  const sim = createSim(COURSE);
  const rec = createRecorder();
  const pilot = createAutopilot(opts);
  while (!sim.finished) {
    const m = pilot(sim);
    record(rec, sim.tick, m);
    step(sim, m);
  }
  return { sim, log: rec.log };
}

export const HOUSE: AutopilotOptions = { jumpAt: 62, slideAt: 60, pitAt: 34, mistakes: COURSE.obstacles.flatMap((o, i) => (o.kind === 'beam' && (o.x === 4620 || o.x === 7700 || o.x === 9580) ? [i] : [])) };

